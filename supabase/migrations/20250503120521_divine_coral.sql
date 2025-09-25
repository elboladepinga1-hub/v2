/*
  # Financial Management System Schema

  1. New Tables
    - `contracts`
      - Contract details from Google Forms
      - Payment tracking
      - Event status
    
    - `transactions`
      - Personal and business transactions
      - Multi-bank support
      - Categorization
    
    - `team_members`
      - Team member profiles
      - Bank account associations
    
    - `categories`
      - Transaction categories
      - Hierarchical structure

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES categories(id),
  type text NOT NULL CHECK (type IN ('income', 'expense', 'investment')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  event_type text NOT NULL,
  package_id uuid REFERENCES packages(id),
  event_date date NOT NULL,
  contract_date date NOT NULL,
  total_amount numeric NOT NULL,
  travel_fee numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  deposit_paid boolean DEFAULT false,
  final_payment_paid boolean DEFAULT false,
  event_completed boolean DEFAULT false,
  team_member_id uuid REFERENCES team_members(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  team_member_id uuid REFERENCES team_members(id),
  bank text NOT NULL CHECK (bank IN ('nubank', 'c6', 'mercadopago')),
  type text NOT NULL CHECK (type IN ('income', 'expense', 'investment')),
  category_id uuid REFERENCES categories(id),
  amount numeric NOT NULL,
  description text,
  contract_id uuid REFERENCES contracts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage contracts"
  ON contracts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial team members
INSERT INTO team_members (name, email, role) VALUES
  ('Adelaida', 'adelaida@example.com', 'photographer'),
  ('Javier', 'javier@example.com', 'videographer'),
  ('Olga', 'olga@example.com', 'assistant');

-- Insert initial categories
INSERT INTO categories (name, type) VALUES
  ('Events', 'income'),
  ('Equipment', 'expense'),
  ('Travel', 'expense'),
  ('Marketing', 'expense'),
  ('Savings', 'investment');