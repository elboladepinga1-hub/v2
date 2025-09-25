/*
  # Create admin settings table

  1. New Tables
    - `admin_settings`
      - `id` (integer, primary key)
      - `is_2fa_setup` (boolean)
      - `totp_secret` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_settings (
  id integer PRIMARY KEY DEFAULT 1,
  is_2fa_setup boolean DEFAULT false,
  totp_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'admin_settings' 
    AND policyname = 'Allow authenticated users to manage admin settings'
  ) THEN
    DROP POLICY "Allow authenticated users to manage admin settings" ON admin_settings;
  END IF;
END $$;

-- Create policy
CREATE POLICY "Allow authenticated users to manage admin settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default row if it doesn't exist
INSERT INTO admin_settings (id, is_2fa_setup)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_admin_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_admin_settings_updated_at
      BEFORE UPDATE ON admin_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;