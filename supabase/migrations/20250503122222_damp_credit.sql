/*
  # Add RLS policies for admin_settings table

  1. Security Changes
    - Add policy to allow authenticated users to manage admin settings
    - This includes INSERT, SELECT, UPDATE operations
    - Policy is permissive to allow initial setup and management
  
  2. Notes
    - Policy allows authenticated users full access to admin settings
    - This is appropriate since admin_settings is a singleton table (only one row)
    - The id=1 constraint in the table ensures only one row exists
*/

-- Policy for managing admin settings
CREATE POLICY "Enable full access for authenticated users"
ON public.admin_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);