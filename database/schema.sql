CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(150) NOT NULL,
  country        VARCHAR(100) NOT NULL,
  region         VARCHAR(60) NOT NULL,
  category       VARCHAR(60) NOT NULL,
  emoji          VARCHAR(10) DEFAULT '?',
  image_path     VARCHAR(300),
  fallback_color VARCHAR(10) DEFAULT '#4a6fa5',
  rating         NUMERIC(3,1) DEFAULT 4.5,
  base_price     BIGINT NOT NULL,
  description    TEXT,
  highlights     TEXT[],
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id  UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  stars           SMALLINT DEFAULT 4,
  price_per_night BIGINT NOT NULL,
  amenities       TEXT[],
  is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS activities (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name           VARCHAR(200) NOT NULL,
  price          BIGINT NOT NULL,
  duration       VARCHAR(60),
  emoji          VARCHAR(10) DEFAULT '*',
  is_active      BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(20) UNIQUE NOT NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  destination_id  UUID REFERENCES destinations(id),
  hotel_id        UUID REFERENCES hotels(id),
  check_in        DATE NOT NULL,
  check_out       DATE NOT NULL,
  guests          SMALLINT NOT NULL DEFAULT 1,
  hotel_cost      BIGINT DEFAULT 0,
  activities_cost BIGINT DEFAULT 0,
  total_amount    BIGINT NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed','rejected')),
  payment_method  VARCHAR(20),
  payment_status  VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded','partial')),
  mpesa_phone     VARCHAR(30),
  notes           TEXT,
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_activities (
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  quantity    SMALLINT DEFAULT 1,
  unit_price  BIGINT NOT NULL,
  PRIMARY KEY (booking_id, activity_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user   ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_users_upd ON users;
CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_upd ON bookings;
CREATE TRIGGER trg_bookings_upd BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Admin user (password: Admin@1234)
INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES ('Admin WorldTrips','admin@worldtrips.ke','+254700000000',
  '$2b$12$wziIo0lhfm2hyiWIdUp0Uuh6Fk0BeB55DGHr3yRYJaH9OQjoRhw46','admin')
ON CONFLICT (email) DO NOTHING;

-- Sample customer (password: Admin@1234)
INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES ('Sarah Kamau','sarah@example.com','+254712345678',
  '$2b$12$wziIo0lhfm2hyiWIdUp0Uuh6Fk0BeB55DGHr3yRYJaH9OQjoRhw46','customer')
ON CONFLICT (email) DO NOTHING;

-- Destinations (no emojis to avoid encoding issues)
INSERT INTO destinations (name,country,region,category,emoji,fallback_color,rating,base_price,description) VALUES
('Masai Mara','Kenya','Africa','Safari','*','#8B5E3C',4.9,240000,'The greatest wildlife show on Earth with the annual Great Migration.'),
('Zanzibar','Tanzania','Africa','Beach','*','#2E6E8E',4.8,156000,'Turquoise waters, white sand beaches and historic Stone Town.'),
('Paris','France','Europe','City','*','#6B5B9E',4.8,312000,'The City of Light with world-class art, cuisine and romance.'),
('Bali','Indonesia','Asia','Culture','*','#4E7C59',4.7,195000,'Rice terraces, ancient temples and world-class surf breaks.'),
('Dubai','UAE','Middle East','Luxury','*','#B8860B',4.7,390000,'Record-breaking skyscrapers, desert adventures and ultra-luxury.'),
('Maldives','Maldives','Asia','Beach','*','#1A7A8A',4.9,520000,'Overwater bungalows and crystal-clear lagoons in paradise.'),
('Santorini','Greece','Europe','Romance','*','#7B9EC3',4.8,280000,'White-washed buildings and world-famous Aegean sunsets.'),
('Tokyo','Japan','Asia','Culture','*','#C23B4E',4.9,260000,'Neon-lit metropolis meets ancient tradition - sushi and temples.'),
('New York','USA','Americas','City','*','#3A5F8A',4.7,350000,'The city that never sleeps with Broadway and iconic skyline.'),
('Cape Town','South Africa','Africa','Adventure','*','#5A7A4A',4.8,182000,'Table Mountain, wine farms and penguins on the beach.'),
('Machu Picchu','Peru','Americas','Adventure','*','#6B7A3E',4.9,298000,'The lost Inca city perched in the Andes clouds.'),
('Barcelona','Spain','Europe','City','*','#C4573A',4.7,234000,'Gaudi masterpieces, tapas culture and Mediterranean beaches.'),
('Iceland','Iceland','Europe','Adventure','*','#3D6B8A',4.8,450000,'Northern Lights, geysers, glaciers and dramatic volcanoes.'),
('Sydney','Australia','Oceania','City','*','#2E7D9A',4.7,320000,'Opera House, Harbour Bridge and world-class Bondi Beach.'),
('Amboseli','Kenya','Africa','Safari','*','#7A6A3E',4.7,188500,'Iconic Kilimanjaro views with Africas largest elephant herds.')
ON CONFLICT DO NOTHING;

-- Hotels
INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Mara Serena Safari Lodge',5,49400,ARRAY['Pool','Spa','WiFi','Restaurant'] FROM destinations WHERE name='Masai Mara' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Governors Camp',5,67600,ARRAY['Spa','WiFi','Bar','Bush Dinners'] FROM destinations WHERE name='Masai Mara' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Ol Seki Hemingways',4,36400,ARRAY['Restaurant','WiFi','Lounge'] FROM destinations WHERE name='Masai Mara' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Zuri Zanzibar Hotel',5,37700,ARRAY['Pool','Spa','WiFi','Beach Bar'] FROM destinations WHERE name='Zanzibar' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Dhow Palace Hotel',4,23400,ARRAY['Restaurant','WiFi','Rooftop'] FROM destinations WHERE name='Zanzibar' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Hotel Le Marais',5,85000,ARRAY['Spa','WiFi','Concierge','Restaurant'] FROM destinations WHERE name='Paris' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Ibis Paris Centre',3,32000,ARRAY['WiFi','Breakfast','24hr Reception'] FROM destinations WHERE name='Paris' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Ubud Hanging Gardens',5,78000,ARRAY['Infinity Pool','Spa','Jungle View','Restaurant'] FROM destinations WHERE name='Bali' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Kuta Beach Resort',4,42000,ARRAY['Pool','WiFi','Beach Access','Bar'] FROM destinations WHERE name='Bali' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Burj Al Arab',5,520000,ARRAY['Private Beach','Butler','Spa','Helicopter Pad'] FROM destinations WHERE name='Dubai' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Atlantis The Palm',5,145000,ARRAY['Waterpark','Pool','Beach','Restaurants'] FROM destinations WHERE name='Dubai' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Conrad Maldives Rangali',5,280000,ARRAY['Overwater Villa','Spa','Diving','Submarine'] FROM destinations WHERE name='Maldives' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Coco Bodu Hithi',5,195000,ARRAY['Private Pool','Beach Villa','Snorkeling','Restaurant'] FROM destinations WHERE name='Maldives' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Hotel Arts Barcelona',5,92000,ARRAY['Pool','Spa','Beach','Fine Dining'] FROM destinations WHERE name='Barcelona' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Casa Fuster Hotel',4,55000,ARRAY['Rooftop Bar','WiFi','Jazz Club','Restaurant'] FROM destinations WHERE name='Barcelona' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'The Retreat Iceland',4,68000,ARRAY['Hot Spring','Northern Lights','Spa','Restaurant'] FROM destinations WHERE name='Iceland' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Canaves Oia Epitome',5,120000,ARRAY['Infinity Pool','Sea View','Spa','Fine Dining'] FROM destinations WHERE name='Santorini' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Grace Hotel Santorini',4,78000,ARRAY['Pool','Caldera View','WiFi','Restaurant'] FROM destinations WHERE name='Santorini' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'The Ritz-Carlton Tokyo',5,185000,ARRAY['Sky Spa','Pool','Concierge','Fine Dining'] FROM destinations WHERE name='Tokyo' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Shinjuku Granbell Hotel',4,52000,ARRAY['City View','WiFi','Bar','Restaurant'] FROM destinations WHERE name='Tokyo' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'The Plaza New York',5,210000,ARRAY['Spa','Butler','Concierge','Fine Dining'] FROM destinations WHERE name='New York' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Pod 51 Hotel',3,65000,ARRAY['WiFi','Lounge','Central Location','Rooftop'] FROM destinations WHERE name='New York' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'The Silo Hotel',5,98000,ARRAY['Rooftop Pool','Art Gallery','Spa','Restaurant'] FROM destinations WHERE name='Cape Town' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Camps Bay Retreat',4,72000,ARRAY['Mountain View','Pool','WiFi','Restaurant'] FROM destinations WHERE name='Cape Town' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Inkaterra Machu Picchu Pueblo',5,145000,ARRAY['Cloud Forest','Spa','Restaurant','Nature Walks'] FROM destinations WHERE name='Machu Picchu' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Sumaq Machu Picchu Hotel',4,88000,ARRAY['Mountain View','Restaurant','WiFi','Tour Desk'] FROM destinations WHERE name='Machu Picchu' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Park Hyatt Sydney',5,160000,ARRAY['Harbour View','Pool','Spa','Fine Dining'] FROM destinations WHERE name='Sydney' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'QT Sydney',4,95000,ARRAY['Rooftop Bar','Spa','WiFi','Restaurant'] FROM destinations WHERE name='Sydney' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Tortilis Camp Amboseli',5,88000,ARRAY['Kilimanjaro View','Pool','Spa','Bush Dining'] FROM destinations WHERE name='Amboseli' ON CONFLICT DO NOTHING;

INSERT INTO hotels (destination_id,name,stars,price_per_night,amenities)
SELECT id,'Ol Tukai Lodge',4,52000,ARRAY['Elephant Views','Pool','WiFi','Restaurant'] FROM destinations WHERE name='Amboseli' ON CONFLICT DO NOTHING;

-- Activities
INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Game Drive Safari',8500,'6 hours','*' FROM destinations WHERE name='Masai Mara' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Hot Air Balloon Ride',32000,'3 hours','*' FROM destinations WHERE name='Masai Mara' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Maasai Village Tour',4500,'2 hours','*' FROM destinations WHERE name='Masai Mara' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Spice Farm Tour',3500,'3 hours','*' FROM destinations WHERE name='Zanzibar' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Snorkeling Trip',5000,'4 hours','*' FROM destinations WHERE name='Zanzibar' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Stone Town Walking Tour',2500,'3 hours','*' FROM destinations WHERE name='Zanzibar' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Eiffel Tower Tour',6500,'2 hours','*' FROM destinations WHERE name='Paris' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Louvre Museum Visit',5500,'3 hours','*' FROM destinations WHERE name='Paris' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Seine River Cruise',4000,'2 hours','*' FROM destinations WHERE name='Paris' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Temple Hopping Tour',5500,'8 hours','*' FROM destinations WHERE name='Bali' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Surf Lesson',6000,'3 hours','*' FROM destinations WHERE name='Bali' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Rice Terrace Trek',4000,'4 hours','*' FROM destinations WHERE name='Bali' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Desert Safari and BBQ',12000,'8 hours','*' FROM destinations WHERE name='Dubai' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Burj Khalifa Top Floor',7500,'2 hours','*' FROM destinations WHERE name='Dubai' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Dubai Creek Dhow Cruise',5000,'3 hours','*' FROM destinations WHERE name='Dubai' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Snorkeling with Rays',9500,'4 hours','*' FROM destinations WHERE name='Maldives' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Sunset Fishing Trip',7000,'3 hours','*' FROM destinations WHERE name='Maldives' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Sagrada Familia Tour',5000,'2 hours','*' FROM destinations WHERE name='Barcelona' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Golden Circle Tour',14000,'8 hours','*' FROM destinations WHERE name='Iceland' ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id,name,price,duration,emoji)
SELECT id,'Northern Lights Hunt',18000,'4 hours','*' FROM destinations WHERE name='Iceland' ON CONFLICT DO NOTHING;

SELECT 'WorldTrips database ready!' AS status;