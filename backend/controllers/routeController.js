const http  = require('http');
const pool  = require('../config/db');

/**
 * Calls OSRM public demo server to calculate a route.
 * Returns GeoJSON LineString geometry and distance/duration.
 * Times out after 8 seconds.
 */
const fetchOSRMRoute = (originLng, originLat, destLng, destLat) => {
  return new Promise((resolve, reject) => {
    const url = `http://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true`;

    const req = http.get(url, { timeout: 8000 }, (resp) => {
      // If OSRM returns non-200 (e.g. HTML error page), reject early
      if (resp.statusCode !== 200) {
        resp.resume(); // discard body
        return reject(new Error(`OSRM returned HTTP ${resp.statusCode}`));
      }

      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.code !== 'Ok' || !parsed.routes || parsed.routes.length === 0) {
            reject(new Error('No route found by OSRM.'));
          } else {
            resolve(parsed.routes);
          }
        } catch (e) {
          reject(new Error('Failed to parse OSRM response.'));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('OSRM request timed out after 8 seconds.'));
    });

    req.on('error', (e) => {
      reject(new Error(`OSRM request failed: ${e.message}`));
    });
  });
};

/**
 * Fallback: generate a simple interpolated route between two points.
 * Creates ~20 intermediate waypoints in a straight line (demo purposes).
 * Also adds a slight curve to look more realistic on the map.
 */
const buildFallbackRoute = (oLat, oLng, dLat, dLng) => {
  const STEPS = 20;
  const coords = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    // Linear interpolation with a small sinusoidal detour
    const lat = oLat + (dLat - oLat) * t;
    const lng = oLng + (dLng - oLng) * t;
    // Small perpendicular wobble to simulate road curves
    const wobble = Math.sin(t * Math.PI) * 0.004;
    coords.push([lng + wobble, lat + wobble * 0.5]);
  }

  const distKm = haversineKm(oLat, oLng, dLat, dLng);
  // Rough estimate: 20 km/h average speed in Karachi city traffic
  const durationSec = Math.round((distKm / 20) * 3600);

  return [{
    geometry:  { type: 'LineString', coordinates: coords },
    distance:  Math.round(distKm * 1000),
    duration:  durationSec,
    _fallback: true, // flag so frontend knows this is estimated
  }];
};

/**
 * Haversine distance between two lat/lng points (km).
 */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Check how close an incident is to a route's coordinates array.
 */
const incidentDistanceToRoute = (incident, routeCoords) => {
  let minDist = Infinity;
  for (const [lng, lat] of routeCoords) {
    const d = haversineKm(incident.latitude, incident.longitude, lat, lng);
    if (d < minDist) minDist = d;
  }
  return minDist;
};

// ─── CALCULATE ROUTE ──────────────────────────────────────────────────────────
const calculateRoute = async (req, res) => {
  try {
    const { origin_lat, origin_lng, dest_lat, dest_lng, origin_name, dest_name, user_id } = req.body;

    if (origin_lat == null || origin_lng == null || dest_lat == null || dest_lng == null) {
      return res.status(400).json({ success: false, message: 'Origin and destination coordinates are required.' });
    }

    const oLat = parseFloat(origin_lat);
    const oLng = parseFloat(origin_lng);
    const dLat = parseFloat(dest_lat);
    const dLng = parseFloat(dest_lng);

    // Fetch route from OSRM — fall back to estimated route if unavailable
    let routes;
    let usedFallback = false;
    try {
      routes = await fetchOSRMRoute(oLng, oLat, dLng, dLat);
    } catch (err) {
      console.warn(`OSRM unavailable (${err.message}), using fallback route.`);
      routes = buildFallbackRoute(oLat, oLng, dLat, dLng);
      usedFallback = true;
    }

    // Fetch nearby incidents (within bounding box + 2km padding)
    const latPad = 0.03, lngPad = 0.03;
    const minLat = Math.min(oLat, dLat) - latPad;
    const maxLat = Math.max(oLat, dLat) + latPad;
    const minLng = Math.min(oLng, dLng) - lngPad;
    const maxLng = Math.max(oLng, dLng) + lngPad;

    const incidentsResult = await pool.query(
      `SELECT i.id, i.title, i.latitude, i.longitude, i.location_name,
              i.incident_datetime, i.status, i.created_at,
              ic.category_name, ic.color_hex
       FROM incidents i
       JOIN incident_categories ic ON i.category_id = ic.id
       WHERE i.latitude BETWEEN $1 AND $2
         AND i.longitude BETWEEN $3 AND $4
         AND i.status IN ('pending', 'verified')
       ORDER BY i.incident_datetime DESC`,
      [minLat, maxLat, minLng, maxLng]
    );

    // For each route, calculate incident proximity
    const enrichedRoutes = routes.map((route) => {
      const coords = route.geometry.coordinates;
      const nearbyIncidents = incidentsResult.rows
        .map((inc) => ({
          ...inc,
          distance_km: parseFloat(incidentDistanceToRoute(inc, coords).toFixed(2)),
        }))
        .filter((inc) => inc.distance_km <= 1.5) // within 1.5 km of route
        .sort((a, b) => a.distance_km - b.distance_km);

      return {
        geometry: route.geometry,
        distance_m: route.distance,
        duration_s: route.duration,
        summary: `${(route.distance / 1000).toFixed(1)} km — approx. ${Math.round(route.duration / 60)} min`,
        nearby_incidents: nearbyIncidents,
      };
    });

    // Optionally save route
    if (req.user && origin_name && dest_name) {
      await pool.query(
        'INSERT INTO saved_routes (user_id, origin, destination) VALUES ($1, $2, $3)',
        [req.user.id, origin_name, dest_name]
      ).catch(() => {}); // non-fatal
    }

    return res.status(200).json({
      success: true,
      fallback: usedFallback,
      disclaimer: usedFallback
        ? '⚠ Live routing service was unavailable. This is an ESTIMATED straight-line route for demonstration only — not actual road directions. Community-reported incidents near this corridor are shown below. This is NOT a safety guarantee.'
        : 'Community-reported incidents shown near this route are unverified by SafeRoute Karachi. This is NOT a safety guarantee. Always use your own judgment and official emergency services.',
      routes: enrichedRoutes,
    });
  } catch (error) {
    console.error('calculateRoute error:', error);
    return res.status(500).json({ success: false, message: 'Route calculation failed.' });
  }
};

module.exports = { calculateRoute };
