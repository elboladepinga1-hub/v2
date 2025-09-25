-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow admin access only" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated users to manage admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON admin_settings;

-- Crear una única política clara y específica
CREATE POLICY "admin_access_policy"
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

-- Asegurar que la tabla tiene RLS habilitado
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Actualizar la configuración del administrador
UPDATE admin_settings
SET 
  is_2fa_setup = true,
  totp_secret = 'JBSWY3DPEHPK3PXP',
  updated_at = NOW()
WHERE id = 1;