/*
  # Add investment tracking tables

  1. New Tables
    - `investments`
      - `id` (uuid, primary key)
      - `date` (date)
      - `amount` (numeric)
      - `description` (text)
      - `category_id` (uuid, references categories)
      - `status` (text) - planned, in_progress, completed
      - `expected_return` (numeric)
      - `actual_return` (numeric)
      - `return_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  description text NOT NULL,
  category_id uuid REFERENCES categories(id),
  status text NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed')),
  expected_return numeric,
  actual_return numeric,
  return_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to manage investments"
  ON investments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX investments_date_idx ON investments(date);
CREATE INDEX investments_category_id_idx ON investments(category_id);
CREATE INDEX investments_status_idx ON investments(status);