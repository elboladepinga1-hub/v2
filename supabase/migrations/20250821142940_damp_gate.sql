/*
  # Create client profiles and update contracts structure

  1. New Tables
    - `client_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `cpf` (text)
      - `rg` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `client_email` column to contracts table for linking with auth users

  3. Security
    - Enable RLS on `client_profiles` table
    - Add policies for authenticated users to manage their own profiles
    - Update contracts policies to allow clients to view their own contracts
*/

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  cpf text,
  rg text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add client_email column to contracts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'client_email'
  ) THEN
    ALTER TABLE contracts ADD COLUMN client_email text;
  END IF;
END $$;

-- Enable RLS on client_profiles
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for client_profiles
CREATE POLICY "Users can view own profile"
  ON client_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON client_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON client_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update contracts policies to allow clients to view their own contracts
CREATE POLICY "Clients can view own contracts"
  ON contracts
  FOR SELECT
  TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR 
    client_name = (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = auth.uid())
  );

-- Create trigger for updating updated_at on client_profiles
CREATE OR REPLACE FUNCTION update_client_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_client_profiles_updated_at();

-- Create function to automatically create client profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO client_profiles (user_id, name, cpf, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();