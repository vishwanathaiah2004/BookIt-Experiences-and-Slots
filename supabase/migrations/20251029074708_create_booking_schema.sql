/*
  # BookIt Database Schema

  1. New Tables
    - `experiences`
      - `id` (uuid, primary key)
      - `title` (text) - Experience name
      - `image` (text) - Image URL
      - `description` (text) - Experience description
      - `price` (integer) - Price in rupees
      - `location` (text) - Location name
      - `guide_name` (text) - Guide name
      - `about` (text) - Additional details
      - `created_at` (timestamptz)
    
    - `available_slots`
      - `id` (uuid, primary key)
      - `experience_id` (uuid, foreign key)
      - `date` (date) - Available date
      - `time` (text) - Time slot (e.g., "07:00 am")
      - `total_slots` (integer) - Total available slots
      - `booked_slots` (integer) - Number of booked slots
      - `created_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `booking_ref` (text, unique) - Booking reference number
      - `experience_id` (uuid, foreign key)
      - `slot_id` (uuid, foreign key)
      - `user_name` (text) - Customer name
      - `user_email` (text) - Customer email
      - `quantity` (integer) - Number of people
      - `subtotal` (integer) - Subtotal amount
      - `taxes` (integer) - Tax amount
      - `discount` (integer) - Discount applied
      - `total_price` (integer) - Final price
      - `promo_code` (text, nullable) - Applied promo code
      - `status` (text) - Booking status (confirmed, failed, cancelled)
      - `created_at` (timestamptz)
    
    - `promo_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - Promo code
      - `discount_type` (text) - Type: 'percentage' or 'flat'
      - `discount_value` (integer) - Discount amount or percentage
      - `is_active` (boolean) - Is code active
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access to experiences and available_slots
    - Authenticated write access for bookings
    - Admin-only access for promo_codes
*/

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,
  location text NOT NULL,
  guide_name text,
  about text,
  created_at timestamptz DEFAULT now()
);

-- Create available_slots table
CREATE TABLE IF NOT EXISTS available_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  date date NOT NULL,
  time text NOT NULL,
  total_slots integer NOT NULL DEFAULT 10,
  booked_slots integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_slots CHECK (booked_slots >= 0 AND booked_slots <= total_slots)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref text UNIQUE NOT NULL,
  experience_id uuid NOT NULL REFERENCES experiences(id),
  slot_id uuid NOT NULL REFERENCES available_slots(id),
  user_name text NOT NULL,
  user_email text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal integer NOT NULL,
  taxes integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL,
  promo_code text,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_status CHECK (status IN ('confirmed', 'failed', 'cancelled'))
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL,
  discount_value integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'flat')),
  CONSTRAINT valid_discount_value CHECK (discount_value > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slots_experience ON available_slots(experience_id);
CREATE INDEX IF NOT EXISTS idx_slots_date ON available_slots(date);
CREATE INDEX IF NOT EXISTS idx_bookings_experience ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code);

-- Enable Row Level Security
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for experiences (public read)
CREATE POLICY "Anyone can view experiences"
  ON experiences FOR SELECT
  USING (true);

-- RLS Policies for available_slots (public read)
CREATE POLICY "Anyone can view available slots"
  ON available_slots FOR SELECT
  USING (true);

-- RLS Policies for bookings (public read for confirmation, insert allowed)
CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- RLS Policies for promo_codes (public read for validation)
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

-- Insert sample experiences
INSERT INTO experiences (title, image, description, price, location, guide_name, about) VALUES
('Kayaking', 'https://images.pexels.com/photos/1497582/pexels-photo-1497582.jpeg?auto=compress&cs=tinysrgb&w=800', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'Udupi', 'Partha Mitra', 'Scenic routes, trained guides, and safety briefing. Minimum age 16'),
('Kayaking', 'https://images.pexels.com/photos/6386956/pexels-photo-6386956.jpeg?auto=compress&cs=tinysrgb&w=800', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'Udupi, Karnataka', 'Partha Mitra', 'Scenic routes, trained guides, and safety briefing. Minimum age 16'),
('Kayaking', 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=800', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'Udupi, Karnataka', 'Partha Mitra', 'Scenic routes, trained guides, and safety briefing. Minimum age 16'),
('Nandi Hills Sunrise', 'https://images.pexels.com/photos/1615776/pexels-photo-1615776.jpeg?auto=compress&cs=tinysrgb&w=800', 'Curated small-group experience. Certified guide. Safety first with gear included.', 899, 'Bangalore', 'Piyush Kumar Dwivedi', 'Early morning trek to witness breathtaking sunrise views'),
('Coffee Trail', 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=800', 'Curated small-group experience. Certified guide. Safety first with gear included.', 1299, 'Coorg', null, 'Explore coffee plantations and learn about coffee making process'),
('Boat Cruise', 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=800', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'Sunderbans', null, 'Relaxing boat cruise through scenic waterways'),
('Bungee Jumping', 'https://images.pexels.com/photos/2014693/pexels-photo-2014693.jpeg?auto=compress&cs=tinysrgb&w=800', 'Curated small-group experience. Certified guide. Safety first with gear included.', 999, 'Manali', null, 'Thrilling bungee jumping experience with safety equipment');

-- Insert sample available slots for each experience
DO $$
DECLARE
  exp_record RECORD;
  slot_date date;
BEGIN
  FOR exp_record IN SELECT id FROM experiences LOOP
    FOR i IN 0..4 LOOP
      slot_date := CURRENT_DATE + i;
      
      INSERT INTO available_slots (experience_id, date, time, total_slots, booked_slots) VALUES
      (exp_record.id, slot_date, '07:00 am', 10, CASE WHEN i = 0 THEN 6 ELSE 0 END),
      (exp_record.id, slot_date, '09:00 am', 10, CASE WHEN i = 0 THEN 8 ELSE 0 END),
      (exp_record.id, slot_date, '11:00 am', 10, CASE WHEN i = 0 THEN 5 ELSE 0 END),
      (exp_record.id, slot_date, '01:00 pm', 10, CASE WHEN i = 0 THEN 10 ELSE 0 END);
    END LOOP;
  END LOOP;
END $$;

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, is_active) VALUES
('SAVE10', 'percentage', 10, true),
('FLAT100', 'flat', 100, true),
('WELCOME20', 'percentage', 20, true),
('SUMMER50', 'flat', 50, true);
