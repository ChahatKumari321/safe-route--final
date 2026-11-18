-- ============================================================
-- SafeRoute Karachi - PostgreSQL Database Schema
-- ============================================================

-- Drop existing tables (safe re-run)
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS saved_routes CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS incident_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120)        NOT NULL,
  email        VARCHAR(255)        NOT NULL UNIQUE,
  password_hash TEXT               NOT NULL,
  role         VARCHAR(20)         NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- INCIDENT CATEGORIES
-- ============================================================
CREATE TABLE incident_categories (
  id            SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  color_hex     VARCHAR(7)   NOT NULL DEFAULT '#e74c3c'
);

INSERT INTO incident_categories (category_name, color_hex) VALUES
  ('Street Crime / Mobile Snatching', '#e74c3c'),
  ('Road Accidents',                  '#e67e22'),
  ('Waterlogging / Flooding',         '#3498db'),
  ('Road Blockages / Protests',       '#9b59b6'),
  ('Poor Street Lighting',            '#f39c12'),
  ('Public Harassment Concerns',      '#e91e63'),
  ('Other Safety Concerns',           '#7f8c8d');

-- ============================================================
-- INCIDENTS
-- ============================================================
CREATE TABLE incidents (
  id               SERIAL PRIMARY KEY,
  user_id          INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id      INT           NOT NULL REFERENCES incident_categories(id),
  title            VARCHAR(200)  NOT NULL,
  description      TEXT          NOT NULL,
  latitude         NUMERIC(10,7) NOT NULL,
  longitude        NUMERIC(10,7) NOT NULL,
  location_name    VARCHAR(255)  NOT NULL,
  incident_datetime TIMESTAMPTZ  NOT NULL,
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','verified','rejected','expired')),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_status    ON incidents(status);
CREATE INDEX idx_incidents_category  ON incidents(category_id);
CREATE INDEX idx_incidents_user      ON incidents(user_id);
CREATE INDEX idx_incidents_location  ON incidents(latitude, longitude);
CREATE INDEX idx_incidents_datetime  ON incidents(incident_datetime DESC);

-- ============================================================
-- VERIFICATIONS (audit trail)
-- ============================================================
CREATE TABLE verifications (
  id          SERIAL PRIMARY KEY,
  incident_id INT          NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  admin_id    INT          NOT NULL REFERENCES users(id),
  decision    VARCHAR(20)  NOT NULL CHECK (decision IN ('verified','rejected','expired')),
  comments    TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verifications_incident ON verifications(incident_id);

-- ============================================================
-- SAVED ROUTES
-- ============================================================
CREATE TABLE saved_routes (
  id          SERIAL PRIMARY KEY,
  user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin      VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SAMPLE DEMONSTRATION DATA (clearly fictional)
-- ============================================================

-- Demo admin account  (password: Admin@1234)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User',   'admin@saferoute.pk',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('Demo User',    'demo@saferoute.pk',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- DEMO INCIDENTS (fictional - for demonstration only)
INSERT INTO incidents (user_id, category_id, title, description, latitude, longitude, location_name, incident_datetime, status) VALUES
  (2, 1, '[DEMO] Phone Snatching Near Tariq Road',
   'FICTIONAL DEMO DATA: A pedestrian reportedly had their phone snatched near Tariq Road. This is sample data only.',
   24.8700, 67.0200, 'Tariq Road, Karachi', NOW() - INTERVAL '2 hours', 'verified'),

  (2, 2, '[DEMO] Minor Collision on Sharae Faisal',
   'FICTIONAL DEMO DATA: Two vehicles reportedly collided near PAF Base gate. This is sample data only.',
   24.8960, 67.1600, 'Sharae Faisal, Karachi', NOW() - INTERVAL '5 hours', 'verified'),

  (2, 3, '[DEMO] Waterlogging on Rashid Minhas Road',
   'FICTIONAL DEMO DATA: Road reportedly submerged after heavy rain near Gulshan-e-Iqbal. This is sample data only.',
   24.9200, 67.1100, 'Rashid Minhas Road, Gulshan-e-Iqbal', NOW() - INTERVAL '1 day', 'pending'),

  (2, 4, '[DEMO] Road Blockage Near Numaish',
   'FICTIONAL DEMO DATA: Protesters reportedly blocking MA Jinnah Road near Numaish Chowrangi. This is sample data only.',
   24.8607, 67.0100, 'MA Jinnah Road, Numaish', NOW() - INTERVAL '3 hours', 'verified'),

  (2, 5, '[DEMO] Street Lights Out in PECHS',
   'FICTIONAL DEMO DATA: Multiple street lights reported non-functional in PECHS Block 2. This is sample data only.',
   24.8700, 67.0600, 'PECHS Block 2, Karachi', NOW() - INTERVAL '2 days', 'pending'),

  (2, 6, '[DEMO] Harassment Report Near City Campus',
   'FICTIONAL DEMO DATA: Incident of verbal harassment reported near a university campus. This is sample data only.',
   24.8607, 67.0300, 'University Road, Karachi', NOW() - INTERVAL '6 hours', 'verified'),

  (2, 1, '[DEMO] Bag Snatching Near Dolmen Mall Clifton',
   'FICTIONAL DEMO DATA: A woman reported her bag was snatched by a motorcyclist near Dolmen Mall Clifton. Sample data only.',
   24.8120, 67.0320, 'Clifton Block 4, Karachi', NOW() - INTERVAL '4 hours', 'verified'),

  (2, 2, '[DEMO] Accident at Teen Talwar Roundabout',
   'FICTIONAL DEMO DATA: A three-vehicle collision was reported at Teen Talwar roundabout causing traffic backup. Sample data only.',
   24.8092, 67.0271, 'Teen Talwar, Clifton, Karachi', NOW() - INTERVAL '8 hours', 'verified'),

  (2, 3, '[DEMO] Flooding at Sindhi Muslim Society',
   'FICTIONAL DEMO DATA: Severe waterlogging reported at Sindhi Muslim Society after overnight rain. Sample data only.',
   24.8780, 67.0650, 'Sindhi Muslim Society, Karachi', NOW() - INTERVAL '12 hours', 'pending'),

  (2, 5, '[DEMO] Broken Street Lights on Korangi Road',
   'FICTIONAL DEMO DATA: Street lights on Korangi Road near Landhi reported as non-functional for a week. Sample data only.',
   24.8300, 67.1300, 'Korangi Road, Karachi', NOW() - INTERVAL '3 days', 'pending'),

  (2, 4, '[DEMO] Road Closure on II Chundrigar Road',
   'FICTIONAL DEMO DATA: Road reportedly closed for a political rally near I.I. Chundrigar Road. Sample data only.',
   24.8650, 67.0200, 'I.I. Chundrigar Road, Karachi', NOW() - INTERVAL '1 hour', 'verified'),

  (2, 7, '[DEMO] Suspicious Activity Near North Karachi',
   'FICTIONAL DEMO DATA: Residents reported suspicious loitering in North Karachi Sector 11-C late at night. Sample data only.',
   24.9700, 67.0600, 'North Karachi Sector 11-C', NOW() - INTERVAL '10 hours', 'pending'),

  (2, 1, '[DEMO] Mobile Snatching at Boat Basin',
   'FICTIONAL DEMO DATA: Two incidents of mobile snatching reportedly occurred at Boat Basin Food Street. Sample data only.',
   24.8155, 67.0355, 'Boat Basin, Clifton, Karachi', NOW() - INTERVAL '7 hours', 'verified'),

  (2, 2, '[DEMO] Road Accident on Northern Bypass',
   'FICTIONAL DEMO DATA: Heavy truck reportedly overturned on Northern Bypass causing major traffic congestion. Sample data only.',
   24.9850, 66.9900, 'Northern Bypass, Karachi', NOW() - INTERVAL '2 hours', 'verified'),

  (2, 6, '[DEMO] Harassment at Saddar Market',
   'FICTIONAL DEMO DATA: Multiple complaints of street harassment received from Saddar market area. Sample data only.',
   24.8600, 67.0100, 'Saddar, Karachi', NOW() - INTERVAL '5 hours', 'pending');
