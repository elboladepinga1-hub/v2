/*
  # Fix Admin Permissions

  1. Changes
    - Drop all existing policies on admin_settings table
    - Create a new consolidated policy for admin access
    - Update admin settings with fixed TOTP secret
    - Ensure RLS is enabled

  2. Security
    - Enable RLS on admin_settings table
    - Add policy for admin access only
    - Set up 2FA configuration
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow admin access only" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated users to manage admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON admin_settings;
DROP POLICY IF EXISTS "admin_access_policy" ON admin_settings;

-- Ensure RLS is enabled
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create new consolidated policy
CREATE POLICY "admin_access_policy"
ON admin_settings
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'email')::text = 'wildpicturesstudio@gmail.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email')::text = 'wildpicturesstudio@gmail.com'
);

-- Update admin settings with fixed TOTP secret
UPDATE admin_settings
SET 
  is_2fa_setup = true,
  totp_secret = 'JBSWY3DPEHPK3PXP',
  updated_at = NOW()
WHERE id = 1;

-- Insert default row if it doesn't exist
INSERT INTO admin_settings (id, is_2fa_setup, totp_secret)
VALUES (1, true, 'JBSWY3DPEHPK3PXP')
ON CONFLICT (id) DO NOTHING;