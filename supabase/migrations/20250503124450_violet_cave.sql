/*
  # Reset admin configuration and setup new admin account

  1. Reset existing configuration
    - Remove existing admin settings
    - Remove existing admin users
  
  2. Setup new admin account
    - Create admin user with email and password
    - Configure 2FA with fixed TOTP secret
*/

-- Reset existing configuration
DELETE FROM admin_settings;
DELETE FROM auth.users WHERE email = 'wildpicturesstudio@gmail.com';

-- Create new admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'wildpicturesstudio@gmail.com',
  crypt('AdelaidaOlga1707', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Setup admin settings with fixed TOTP secret
INSERT INTO admin_settings (
  id,
  is_2fa_setup,
  totp_secret,
  created_at,
  updated_at
)
VALUES (
  1,
  true,
  'JBSWY3DPEHPK3PXP',
  NOW(),
  NOW()
);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow admin access only" ON admin_settings;
CREATE POLICY "Allow admin access only"
ON admin_settings
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE email = 'wildpicturesstudio@gmail.com'
    AND (raw_app_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE email = 'wildpicturesstudio@gmail.com'
    AND (raw_app_meta_data->>'role')::text = 'admin'
  )
);