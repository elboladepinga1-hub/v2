/*
  # Add estimated income table and data

  1. New Tables
    - `estimated_income`
      - `id` (uuid, primary key)
      - `month` (date, first day of month)
      - `amount` (numeric)
      - `source` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create estimated income table
CREATE TABLE IF NOT EXISTS estimated_income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  source text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE estimated_income ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to manage estimated income"
  ON estimated_income FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_estimated_income_updated_at
  BEFORE UPDATE ON estimated_income
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for better performance
CREATE INDEX estimated_income_month_idx ON estimated_income(month);

-- Insert test data for the next 10 months
INSERT INTO estimated_income (month, amount, source, notes) VALUES
(date_trunc('month', CURRENT_DATE + INTERVAL '1 month'), 12500.00, 'Events', '3 weddings, 2 corporate events scheduled'),
(date_trunc('month', CURRENT_DATE + INTERVAL '2 months'), 15000.00, 'Events', 'Peak wedding season, 4 weddings booked'),
(date_trunc('month', CURRENT_DATE + INTERVAL '3 months'), 13800.00, 'Mixed', '2 weddings, 3 portrait sessions, 1 corporate event'),
(date_trunc('month', CURRENT_DATE + INTERVAL '4 months'), 11200.00, 'Events', '2 weddings, 1 large corporate event'),
(date_trunc('month', CURRENT_DATE + INTERVAL '5 months'), 9500.00, 'Portrait Sessions', 'Multiple graduation and family sessions'),
(date_trunc('month', CURRENT_DATE + INTERVAL '6 months'), 14200.00, 'Events', '3 weddings, holiday season bookings'),
(date_trunc('month', CURRENT_DATE + INTERVAL '7 months'), 16500.00, 'Mixed', 'Year-end events and corporate bookings'),
(date_trunc('month', CURRENT_DATE + INTERVAL '8 months'), 10800.00, 'Portrait Sessions', 'New year family sessions'),
(date_trunc('month', CURRENT_DATE + INTERVAL '9 months'), 12000.00, 'Events', '2 weddings, 2 corporate events'),
(date_trunc('month', CURRENT_DATE + INTERVAL '10 months'), 13500.00, 'Mixed', '2 weddings, multiple portrait sessions');