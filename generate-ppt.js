const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();

// Layout 16:9
pres.layout = 'LAYOUT_16x9';

// Brand colors
const NAVY = '0D1B2A';
const NAVY_MID = '1B2A3B';
const NAVY_LIGHT = '243447';
const TEAL = '00B4D8';
const TEAL_LIGHT = '48CAE4';
const WHITE = 'F8FAFC';
const GRAY = '94A3B8';
const RED = 'EF4444';
const GREEN = '10B981';

// Slide 1: Title
let s1 = pres.addSlide();
s1.background = { color: NAVY };

s1.addText('🛡️ SafeRoute Karachi', {
  x: 0.8, y: 1.5, w: 11.7, h: 1.2,
  fontSize: 44, fontFace: 'Segoe UI', color: WHITE, bold: true, align: 'left'
});

s1.addText('Community-Powered Urban Safety Awareness & Incident Navigation Platform', {
  x: 0.8, y: 2.7, w: 11.7, h: 0.8,
  fontSize: 22, fontFace: 'Segoe UI', color: TEAL, bold: false, align: 'left'
});

s1.addShape(pres.ShapeType.line, {
  x: 0.8, y: 3.6, w: 4.5, h: 0,
  line: { color: TEAL, width: 3 }
});

s1.addText('A real-time crowdsourced safety mapping and travel corridor awareness web platform designed specifically for Karachi, Pakistan.', {
  x: 0.8, y: 4.0, w: 9.0, h: 1.0,
  fontSize: 16, fontFace: 'Segoe UI', color: GRAY, align: 'left'
});

s1.addText('Full-Stack Hackathon & Project Submission | Built with Node.js, Express, PostgreSQL & Vanilla JS', {
  x: 0.8, y: 5.8, w: 10.0, h: 0.5,
  fontSize: 14, fontFace: 'Segoe UI', color: TEAL_LIGHT, italic: true
});

// Helper for content slides
function createSlide(title, subtitle) {
  let s = pres.addSlide();
  s.background = { color: NAVY };

  // Top banner accent
  s.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 0.5, w: 0.15, h: 0.9,
    fill: { color: TEAL }
  });

  s.addText(title, {
    x: 1.1, y: 0.45, w: 10.5, h: 0.5,
    fontSize: 26, fontFace: 'Segoe UI', color: WHITE, bold: true
  });

  if (subtitle) {
    s.addText(subtitle, {
      x: 1.1, y: 0.95, w: 10.5, h: 0.4,
      fontSize: 13, fontFace: 'Segoe UI', color: TEAL
    });
  }

  // Footer
  s.addText('SafeRoute Karachi 🛡️ | Community Safety Platform', {
    x: 0.8, y: 7.0, w: 6.0, h: 0.3,
    fontSize: 10, fontFace: 'Segoe UI', color: GRAY
  });

  return s;
}

// Slide 2: Problem Statement
let s2 = createSlide('The Challenge: Urban Mobility in Karachi', 'Critical safety and navigation gaps in Pakistan\'s largest metropolis');

s2.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 5.4, h: 4.8, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: RED, width: 1.5 }
});
s2.addText('⚠️ Current Realities in Karachi', {
  x: 1.1, y: 1.9, w: 4.8, h: 0.5,
  fontSize: 18, fontFace: 'Segoe UI', color: RED, bold: true
});
s2.addText([
  { text: '• Mega-City Scale: ', options: { bold: true, color: WHITE } },
  { text: '16M+ residents navigating daily traffic, transit, and security challenges.\n\n', options: { color: GRAY } },
  { text: '• Information Vacuum: ', options: { bold: true, color: WHITE } },
  { text: 'Commuters unwittingly enter flash-flood waters, protest blockades, or crime hotspots.\n\n', options: { color: GRAY } },
  { text: '• Fragmented Data: ', options: { bold: true, color: WHITE } },
  { text: 'Incident news is trapped in closed WhatsApp groups and unverified social posts.\n\n', options: { color: GRAY } },
  { text: '• No Preventive Corridor Awareness: ', options: { bold: true, color: WHITE } },
  { text: 'Mainstream navigation tools prioritize speed, ignoring civic danger alerts.', options: { color: GRAY } }
], { x: 1.1, y: 2.5, w: 4.8, h: 3.8, fontSize: 13, fontFace: 'Segoe UI' });

s2.addShape(pres.ShapeType.roundRect, {
  x: 6.6, y: 1.7, w: 5.8, h: 4.8, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: TEAL, width: 1.5 }
});
s2.addText('🎯 The Opportunity', {
  x: 6.9, y: 1.9, w: 5.2, h: 0.5,
  fontSize: 18, fontFace: 'Segoe UI', color: TEAL, bold: true
});
s2.addText([
  { text: '• Centralized Spatial Intelligence: ', options: { bold: true, color: WHITE } },
  { text: 'A single, public, interactive city map for verified local alerts.\n\n', options: { color: GRAY } },
  { text: '• Route Corridor Scanning: ', options: { bold: true, color: WHITE } },
  { text: 'Check incidents along a journey before leaving home or office.\n\n', options: { color: GRAY } },
  { text: '• Responsible Disclaimers: ', options: { bold: true, color: WHITE } },
  { text: 'Transparent distinction between verified reports and community-submitted alerts.\n\n', options: { color: GRAY } },
  { text: '• Rapid Community Reporting: ', options: { bold: true, color: WHITE } },
  { text: 'Citizens actively protect fellow citizens with zero friction.', options: { color: GRAY } }
], { x: 6.9, y: 2.5, w: 5.2, h: 3.8, fontSize: 13, fontFace: 'Segoe UI' });

// Slide 3: Solution
let s3 = createSlide('The Solution: SafeRoute Karachi', 'A community-driven safety ecosystem empowering civic awareness');

const features = [
  { icon: '🗺️', title: 'Interactive City Map', desc: 'Real-time Leaflet & OpenStreetMap visualization with category color coding and popups.' },
  { icon: '📢', title: 'Point-and-Click Reporting', desc: 'Drop pins anywhere in Karachi with client-side coordinate validation & tamper protection.' },
  { icon: '🛣️', title: 'Route Awareness Engine', desc: 'Calculates routes and scans for incidents within a 1.5 km corridor along the path.' },
  { icon: '🛡️', title: 'Two-Tier Moderation', desc: 'Admins verify, reject, or expire alerts to eliminate fake news and prevent panic.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Chart.js visual statistics by category, area frequency, and 7-day reporting trends.' },
  { icon: '🔒', title: 'Privacy & Security Guard', desc: 'No victim/suspect PII stored. Parameterized SQL queries and rate-limiting active.' }
];

features.forEach((f, idx) => {
  let row = Math.floor(idx / 3);
  let col = idx % 3;
  let x = 0.8 + col * 3.9;
  let y = 1.7 + row * 2.5;

  s3.addShape(pres.ShapeType.roundRect, {
    x: x, y: y, w: 3.6, h: 2.2, r: 0.15,
    fill: { color: NAVY_MID }, line: { color: NAVY_LIGHT, width: 1 }
  });
  s3.addText(`${f.icon} ${f.title}`, {
    x: x + 0.2, y: y + 0.2, w: 3.2, h: 0.4,
    fontSize: 14, fontFace: 'Segoe UI', color: TEAL, bold: true
  });
  s3.addText(f.desc, {
    x: x + 0.2, y: y + 0.7, w: 3.2, h: 1.3,
    fontSize: 11, fontFace: 'Segoe UI', color: WHITE
  });
});

// Slide 4: Tech Stack
let s4 = createSlide('Technology Architecture', 'Built strictly with lightweight, standards-compliant, high-performance tech');

const stacks = [
  {
    title: 'Frontend Architecture', color: TEAL,
    items: ['HTML5 & Modern CSS3 (Dark Navy / Teal theme)', 'Vanilla JavaScript ES6+ (Zero bloated frameworks)', 'Leaflet.js & OpenStreetMap tile integration', 'Chart.js v4 for administrative data visualization', 'Fully responsive for Desktop, Tablet & Mobile']
  },
  {
    title: 'Backend REST API', color: TEAL_LIGHT,
    items: ['Node.js & Express.js RESTful endpoints', 'JWT Authentication & Bearer token verification', 'bcryptjs password hashing (10 salt rounds)', 'express-rate-limit protection against spam attacks', 'Comprehensive error handling & sanitization']
  },
  {
    title: 'PostgreSQL Database', color: GREEN,
    items: ['Normalized relational schema (`pg` client)', 'Strict foreign keys & cascading constraints', 'Spatial coordinate validation (Karachi bounds)', 'Parameterized queries (SQL injection immunity)', 'Audit trail table tracking all admin verifications']
  }
];

stacks.forEach((st, idx) => {
  let x = 0.8 + idx * 3.9;
  s4.addShape(pres.ShapeType.roundRect, {
    x: x, y: 1.8, w: 3.6, h: 4.8, r: 0.2,
    fill: { color: NAVY_MID }, line: { color: st.color, width: 2 }
  });
  s4.addText(st.title, {
    x: x + 0.2, y: 2.0, w: 3.2, h: 0.5,
    fontSize: 16, fontFace: 'Segoe UI', color: st.color, bold: true
  });
  let bulletText = st.items.map(it => `• ${it}\n\n`).join('');
  s4.addText(bulletText, {
    x: x + 0.2, y: 2.7, w: 3.2, h: 3.7,
    fontSize: 12, fontFace: 'Segoe UI', color: WHITE
  });
});

// Slide 5: 7 Incident Categories
let s5 = createSlide('Comprehensive Incident Taxonomy', 'Color-coded categorization for immediate visual identification');

const cats = [
  { name: 'Street Crime / Mobile Snatching', color: 'E74C3C', desc: 'Snatching, mugging, and theft reports' },
  { name: 'Road Accidents', color: 'E67E22', desc: 'Collisions, rollovers, and transit hazards' },
  { name: 'Waterlogging / Flooding', color: '3498DB', desc: 'Submerged roads and monsoon blockages' },
  { name: 'Road Blockages / Protests', color: '9B59B6', desc: 'Rallies, closures, and major traffic halts' },
  { name: 'Poor Street Lighting', color: 'F39C12', desc: 'Broken street lamps & dark transit stretches' },
  { name: 'Public Harassment Concerns', color: 'E91E63', desc: 'Safety concerns for women & vulnerable transit' },
  { name: 'Other Safety Concerns', color: '7F8C8D', desc: 'Infrastructure and community hazards' }
];

cats.forEach((c, idx) => {
  let row = Math.floor(idx / 4);
  let col = idx % 4;
  let x = 0.8 + col * 2.9;
  let y = 1.8 + row * 2.4;

  s5.addShape(pres.ShapeType.roundRect, {
    x: x, y: y, w: 2.7, h: 2.1, r: 0.15,
    fill: { color: NAVY_MID }, line: { color: c.color, width: 2 }
  });

  s5.addShape(pres.ShapeType.ellipse, {
    x: x + 0.2, y: y + 0.25, w: 0.25, h: 0.25,
    fill: { color: c.color }
  });

  s5.addText(c.name, {
    x: x + 0.55, y: y + 0.2, w: 2.0, h: 0.6,
    fontSize: 11, fontFace: 'Segoe UI', color: WHITE, bold: true
  });

  s5.addText(c.desc, {
    x: x + 0.2, y: y + 0.9, w: 2.3, h: 1.0,
    fontSize: 10, fontFace: 'Segoe UI', color: GRAY
  });
});

// Slide 6: Route Awareness Feature
let s6 = createSlide('Route Awareness & Travel Corridor Scanning', 'Intelligent routing combined with proximity incident detection');

s6.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 6.0, h: 4.8, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: TEAL, width: 1.5 }
});
s6.addText('How Route Awareness Works', {
  x: 1.1, y: 1.9, w: 5.4, h: 0.5,
  fontSize: 18, fontFace: 'Segoe UI', color: TEAL, bold: true
});
s6.addText([
  { text: '1. Origin & Destination Input:\n', options: { bold: true, color: WHITE } },
  { text: 'Users type locations or directly click origin/dest points on the Karachi map.\n\n', options: { color: GRAY } },
  { text: '2. High-Speed Routing:\n', options: { bold: true, color: WHITE } },
  { text: 'Calls OSRM routing engine with a built-in fallback algorithm so routes never fail.\n\n', options: { color: GRAY } },
  { text: '3. Spatial Proximity Scan:\n', options: { bold: true, color: WHITE } },
  { text: 'Applies Haversine mathematics to calculate exact distance of all active incidents within 1.5 km of the travel path.\n\n', options: { color: GRAY } },
  { text: '4. Summary & Timestamps:\n', options: { bold: true, color: WHITE } },
  { text: 'Outputs trip distance, estimated driving duration, and incident count with verification badges.', options: { color: GRAY } }
], { x: 1.1, y: 2.5, w: 5.4, h: 3.8, fontSize: 12, fontFace: 'Segoe UI' });

s6.addShape(pres.ShapeType.roundRect, {
  x: 7.2, y: 1.7, w: 5.2, h: 4.8, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: GREEN, width: 1.5 }
});
s6.addText('Key Ethical Safeguard', {
  x: 7.5, y: 1.9, w: 4.6, h: 0.5,
  fontSize: 18, fontFace: 'Segoe UI', color: GREEN, bold: true
});
s6.addText([
  { text: 'No False Safety Guarantees:\n\n', options: { bold: true, color: WHITE } },
  { text: 'Unlike apps that produce misleading "safety scores", SafeRoute explicitly warns commuters that unverified reports exist and safety conditions change dynamically.\n\n', options: { color: GRAY } },
  { text: 'Emergency Helpline Quick Links:\n\n', options: { bold: true, color: WHITE } },
  { text: 'Emergency numbers (Police 15, Rescue 1122, Edhi 115) remain accessible on every screen.', options: { color: GRAY } }
], { x: 7.5, y: 2.6, w: 4.6, h: 3.6, fontSize: 12, fontFace: 'Segoe UI' });

// Slide 7: Admin & Moderation
let s7 = createSlide('Administrative Moderation & Verification Pipeline', 'Ensuring community integrity, eliminating hoaxes, and maintaining trust');

s7.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 3.6, h: 4.8, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: 'F59E0B', width: 1.5 }
});
s7.addText('1. Submission (Pending)', { x: 1.0, y: 2.0, w: 3.2, h: 0.4, fontSize: 15, fontFace: 'Segoe UI', color: 'F59E0B', bold: true });
s7.addText('User submits incident report with title, description, time, and map pin.\n\nStatus defaults to "pending" with orange badge on map and dashboard.', { x: 1.0, y: 2.6, w: 3.2, h: 3.5, fontSize: 12, fontFace: 'Segoe UI', color: GRAY });

s7.addShape(pres.ShapeType.roundRect, {
  x: 4.8, y: 1.7, w: 3.6, h: 4.8, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: TEAL, width: 1.5 }
});
s7.addText('2. Review & Audit', { x: 5.0, y: 2.0, w: 3.2, h: 0.4, fontSize: 15, fontFace: 'Segoe UI', color: TEAL, bold: true });
s7.addText('Admins inspect incoming reports on moderation queue.\n\nDecisions recorded in PostgreSQL `verifications` table with admin ID, timestamp & comments.', { x: 5.0, y: 2.6, w: 3.2, h: 3.5, fontSize: 12, fontFace: 'Segoe UI', color: GRAY });

s7.addShape(pres.ShapeType.roundRect, {
  x: 8.8, y: 1.7, w: 3.6, h: 4.8, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: GREEN, width: 1.5 }
});
s7.addText('3. Status Updates', { x: 9.0, y: 2.0, w: 3.2, h: 0.4, fontSize: 15, fontFace: 'Segoe UI', color: GREEN, bold: true });
s7.addText('• Verified: Displayed as confirmed.\n• Rejected: Hoaxes removed.\n• Expired: Outdated incidents retired.\n• Deleted: Defamatory content eradicated.', { x: 9.0, y: 2.6, w: 3.2, h: 3.5, fontSize: 12, fontFace: 'Segoe UI', color: GRAY });

// Slide 8: Security & Privacy
let s8 = createSlide('Security, Privacy & Responsible Engineering', 'Industry-standard defense in depth protecting user confidentiality');

const secItems = [
  { title: '🔒 Cryptographic Password Security', desc: 'Passwords hashed with bcryptjs salt rounds. Plaintext passwords never logged or saved.' },
  { title: '🛡️ Role-Based Access Control (RBAC)', desc: 'Dual-tier roles (`user`, `admin`). Admin endpoints guarded with multi-step JWT verification.' },
  { title: '🛑 Rate Limiting & Anti-Spam', desc: 'Express rate limiters restrict authentication and report submissions to prevent spam attacks.' },
  { title: '💉 SQL Injection Immunity', desc: '100% parameterized SQL queries via `pg` pool. Zero string-concatenated SQL queries.' },
  { title: '📍 Geo-Fencing & Validation', desc: 'Coordinate boundaries strictly locked between Karachi latitudes 24.5-25.2 and longitudes 66.5-67.5.' },
  { title: '👤 Anonymized Incident Reporting', desc: 'Reports record descriptions and locations without publishing victim or offender personal identities.' }
];

secItems.forEach((sc, idx) => {
  let row = Math.floor(idx / 2);
  let col = idx % 2;
  let x = 0.8 + col * 5.9;
  let y = 1.8 + row * 1.6;

  s8.addShape(pres.ShapeType.roundRect, {
    x: x, y: y, w: 5.6, h: 1.4, r: 0.15,
    fill: { color: NAVY_MID }, line: { color: NAVY_LIGHT, width: 1 }
  });
  s8.addText(sc.title, {
    x: x + 0.2, y: y + 0.15, w: 5.2, h: 0.35,
    fontSize: 13, fontFace: 'Segoe UI', color: TEAL, bold: true
  });
  s8.addText(sc.desc, {
    x: x + 0.2, y: y + 0.55, w: 5.2, h: 0.75,
    fontSize: 10.5, fontFace: 'Segoe UI', color: GRAY
  });
});

// Slide 9: Demo & User Experience
let s9 = createSlide('Demonstrable Capabilities & Live Flow', 'Complete end-to-end user workflow ready for evaluation');

const steps = [
  { step: '1', title: 'Interactive Map Explorer', text: 'Filter 15+ pre-seeded Karachi incidents across Clifton, Saddar, Tariq Road, Gulshan-e-Iqbal.' },
  { step: '2', title: 'Route Awareness Test', text: 'Enter "Numaish" to "Clifton" to see route geometry and nearby community alerts.' },
  { step: '3', title: 'Incident Submission', text: 'Registered users pin incident location directly on map with category selection.' },
  { step: '4', title: 'Admin Verification', text: 'Admin logs in, inspects pending reports, and updates status with comments.' },
  { step: '5', title: 'Real-Time Visual Stats', text: 'Chart.js displays dynamic category breakdown and 7-day reporting trend.' }
];

steps.forEach((st, idx) => {
  let y = 1.8 + idx * 0.95;
  s9.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: y, w: 11.6, h: 0.8, r: 0.1,
    fill: { color: NAVY_MID }, line: { color: NAVY_LIGHT, width: 1 }
  });
  s9.addShape(pres.ShapeType.ellipse, {
    x: 1.0, y: y + 0.15, w: 0.5, h: 0.5,
    fill: { color: TEAL }
  });
  s9.addText(st.step, {
    x: 1.0, y: y + 0.15, w: 0.5, h: 0.5,
    fontSize: 13, fontFace: 'Segoe UI', color: NAVY, bold: true, align: 'center'
  });
  s9.addText(st.title, {
    x: 1.7, y: y + 0.22, w: 3.2, h: 0.35,
    fontSize: 13, fontFace: 'Segoe UI', color: WHITE, bold: true
  });
  s9.addText(st.text, {
    x: 5.0, y: y + 0.22, w: 7.2, h: 0.35,
    fontSize: 11, fontFace: 'Segoe UI', color: GRAY
  });
});

// Slide 10: Conclusion & Impact
let s10 = pres.addSlide();
s10.background = { color: NAVY };

s10.addText('SafeRoute Karachi 🛡️', {
  x: 0.8, y: 1.2, w: 11.7, h: 0.8,
  fontSize: 38, fontFace: 'Segoe UI', color: WHITE, bold: true
});

s10.addText('Making Urban Transit in Karachi Safer, More Transparent, and Community-Powered', {
  x: 0.8, y: 2.1, w: 11.7, h: 0.5,
  fontSize: 18, fontFace: 'Segoe UI', color: TEAL
});

s10.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 3.0, w: 5.5, h: 3.2, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: TEAL, width: 1 }
});
s10.addText('Community & Social Impact', { x: 1.1, y: 3.2, w: 4.9, h: 0.4, fontSize: 16, fontFace: 'Segoe UI', color: TEAL, bold: true });
s10.addText('• Empowers daily commuters, women, delivery workers & students.\n• Fills the critical gap between emergency response and public alerts.\n• Eliminates panic-inducing rumors via structured admin verification.', {
  x: 1.1, y: 3.8, w: 4.9, h: 2.2, fontSize: 12, fontFace: 'Segoe UI', color: WHITE
});

s10.addShape(pres.ShapeType.roundRect, {
  x: 6.9, y: 3.0, w: 5.5, h: 3.2, r: 0.2,
  fill: { color: NAVY_MID }, line: { color: GREEN, width: 1 }
});
s10.addText('Project Deliverables Summary', { x: 7.2, y: 3.2, w: 4.9, h: 0.4, fontSize: 16, fontFace: 'Segoe UI', color: GREEN, bold: true });
s10.addText('✅ 8 Full-Featured Responsive Frontend Pages\n✅ Secure Node.js & Express REST Backend\n✅ Normalized PostgreSQL Schema with 15+ Seeded Demo Records\n✅ Complete Documentation & Deployment Readiness', {
  x: 7.2, y: 3.8, w: 4.9, h: 2.2, fontSize: 12, fontFace: 'Segoe UI', color: WHITE
});

const outputPath = path.join(__dirname, 'SafeRoute-Karachi-Presentation.pptx');
pres.writeFile({ fileName: outputPath }).then(fileName => {
  console.log(`PowerPoint presentation generated successfully: ${fileName}`);
}).catch(err => {
  console.error('Error generating PPTX:', err);
});
