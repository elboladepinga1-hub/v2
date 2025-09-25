/*
  # Add test transactions and subcategories

  1. Add subcategories to categories table
  2. Add test transactions with proper categorization
*/

-- Add subcategories for income
INSERT INTO categories (name, parent_id, type) 
SELECT 'Wedding Photography', id, 'income'
FROM categories 
WHERE name = 'Events' AND type = 'income';

INSERT INTO categories (name, parent_id, type) 
SELECT 'Portrait Sessions', id, 'income'
FROM categories 
WHERE name = 'Events' AND type = 'income';

INSERT INTO categories (name, parent_id, type) 
SELECT 'Corporate Events', id, 'income'
FROM categories 
WHERE name = 'Events' AND type = 'income';

-- Add subcategories for expenses
INSERT INTO categories (name, parent_id, type) 
SELECT 'Camera Equipment', id, 'expense'
FROM categories 
WHERE name = 'Equipment' AND type = 'expense';

INSERT INTO categories (name, parent_id, type) 
SELECT 'Lighting Equipment', id, 'expense'
FROM categories 
WHERE name = 'Equipment' AND type = 'expense';

INSERT INTO categories (name, parent_id, type) 
SELECT 'Transportation', id, 'expense'
FROM categories 
WHERE name = 'Travel' AND type = 'expense';

-- Add test income transactions
INSERT INTO transactions (date, bank, type, category_id, amount, description, team_member_id) VALUES
(CURRENT_DATE - INTERVAL '30 days', 'nubank', 'income', 
 (SELECT id FROM categories WHERE name = 'Wedding Photography' AND type = 'income'), 
 2500.00, 'Wedding Photography - Silva Family',
 (SELECT id FROM team_members WHERE name = 'Adelaida')),

(CURRENT_DATE - INTERVAL '25 days', 'c6', 'income', 
 (SELECT id FROM categories WHERE name = 'Portrait Sessions' AND type = 'income'),
 1800.00, 'Birthday Party Photography',
 (SELECT id FROM team_members WHERE name = 'Javier')),

(CURRENT_DATE - INTERVAL '20 days', 'mercadopago', 'income', 
 (SELECT id FROM categories WHERE name = 'Corporate Events' AND type = 'income'),
 3000.00, 'Corporate Event Coverage',
 (SELECT id FROM team_members WHERE name = 'Olga')),

(CURRENT_DATE - INTERVAL '15 days', 'nubank', 'income', 
 (SELECT id FROM categories WHERE name = 'Portrait Sessions' AND type = 'income'),
 2200.00, 'Engagement Session',
 (SELECT id FROM team_members WHERE name = 'Adelaida')),

(CURRENT_DATE - INTERVAL '12 days', 'c6', 'income', 
 (SELECT id FROM categories WHERE name = 'Portrait Sessions' AND type = 'income'),
 1500.00, 'Family Portrait Session',
 (SELECT id FROM team_members WHERE name = 'Javier')),

(CURRENT_DATE - INTERVAL '10 days', 'mercadopago', 'income', 
 (SELECT id FROM categories WHERE name = 'Wedding Photography' AND type = 'income'),
 2800.00, 'Wedding Photography - Santos Family',
 (SELECT id FROM team_members WHERE name = 'Adelaida')),

(CURRENT_DATE - INTERVAL '8 days', 'nubank', 'income', 
 (SELECT id FROM categories WHERE name = 'Portrait Sessions' AND type = 'income'),
 1900.00, 'Maternity Photo Session',
 (SELECT id FROM team_members WHERE name = 'Olga')),

(CURRENT_DATE - INTERVAL '6 days', 'c6', 'income', 
 (SELECT id FROM categories WHERE name = 'Corporate Events' AND type = 'income'),
 2100.00, 'Product Photography',
 (SELECT id FROM team_members WHERE name = 'Javier')),

(CURRENT_DATE - INTERVAL '4 days', 'mercadopago', 'income', 
 (SELECT id FROM categories WHERE name = 'Wedding Photography' AND type = 'income'),
 2700.00, 'Wedding Photography - Lima Family',
 (SELECT id FROM team_members WHERE name = 'Adelaida')),

(CURRENT_DATE - INTERVAL '2 days', 'nubank', 'income', 
 (SELECT id FROM categories WHERE name = 'Portrait Sessions' AND type = 'income'),
 1600.00, 'Graduation Photos',
 (SELECT id FROM team_members WHERE name = 'Olga'));

-- Add test expense transactions
INSERT INTO transactions (date, bank, type, category_id, amount, description) VALUES
(CURRENT_DATE - INTERVAL '28 days', 'nubank', 'expense', 
 (SELECT id FROM categories WHERE name = 'Camera Equipment' AND type = 'expense'),
 800.00, 'New Camera Lens'),

(CURRENT_DATE - INTERVAL '23 days', 'c6', 'expense', 
 (SELECT id FROM categories WHERE name = 'Transportation' AND type = 'expense'),
 300.00, 'Travel Expenses - Wedding Coverage'),

(CURRENT_DATE - INTERVAL '18 days', 'mercadopago', 'expense', 
 (SELECT id FROM categories WHERE name = 'Marketing' AND type = 'expense'),
 250.00, 'Social Media Advertising'),

(CURRENT_DATE - INTERVAL '14 days', 'nubank', 'expense', 
 (SELECT id FROM categories WHERE name = 'Lighting Equipment' AND type = 'expense'),
 450.00, 'Lighting Equipment'),

(CURRENT_DATE - INTERVAL '11 days', 'c6', 'expense', 
 (SELECT id FROM categories WHERE name = 'Transportation' AND type = 'expense'),
 200.00, 'Fuel Expenses'),

(CURRENT_DATE - INTERVAL '9 days', 'mercadopago', 'expense', 
 (SELECT id FROM categories WHERE name = 'Marketing' AND type = 'expense'),
 350.00, 'Website Maintenance'),

(CURRENT_DATE - INTERVAL '7 days', 'nubank', 'expense', 
 (SELECT id FROM categories WHERE name = 'Camera Equipment' AND type = 'expense'),
 600.00, 'Camera Maintenance'),

(CURRENT_DATE - INTERVAL '5 days', 'c6', 'expense', 
 (SELECT id FROM categories WHERE name = 'Transportation' AND type = 'expense'),
 280.00, 'Travel Expenses - Corporate Event'),

(CURRENT_DATE - INTERVAL '3 days', 'mercadopago', 'expense', 
 (SELECT id FROM categories WHERE name = 'Marketing' AND type = 'expense'),
 150.00, 'Business Cards'),

(CURRENT_DATE - INTERVAL '1 day', 'nubank', 'expense', 
 (SELECT id FROM categories WHERE name = 'Camera Equipment' AND type = 'expense'),
 900.00, 'New Tripod and Accessories');