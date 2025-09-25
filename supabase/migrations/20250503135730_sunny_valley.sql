/*
  # Add test transactions

  This migration adds 10 income and 10 expense transactions for testing purposes.
  The transactions are spread across different categories and dates.
*/

-- Add test income transactions
INSERT INTO transactions (date, bank, type, category_id, amount, description) VALUES
(CURRENT_DATE - INTERVAL '30 days', 'nubank', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 2500.00, 'Wedding Photography - Silva Family'),
(CURRENT_DATE - INTERVAL '25 days', 'c6', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 1800.00, 'Birthday Party Photography'),
(CURRENT_DATE - INTERVAL '20 days', 'mercadopago', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 3000.00, 'Corporate Event Coverage'),
(CURRENT_DATE - INTERVAL '15 days', 'nubank', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 2200.00, 'Engagement Session'),
(CURRENT_DATE - INTERVAL '12 days', 'c6', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 1500.00, 'Family Portrait Session'),
(CURRENT_DATE - INTERVAL '10 days', 'mercadopago', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 2800.00, 'Wedding Photography - Santos Family'),
(CURRENT_DATE - INTERVAL '8 days', 'nubank', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 1900.00, 'Maternity Photo Session'),
(CURRENT_DATE - INTERVAL '6 days', 'c6', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 2100.00, 'Product Photography'),
(CURRENT_DATE - INTERVAL '4 days', 'mercadopago', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 2700.00, 'Wedding Photography - Lima Family'),
(CURRENT_DATE - INTERVAL '2 days', 'nubank', 'income', (SELECT id FROM categories WHERE name = 'Events' LIMIT 1), 1600.00, 'Graduation Photos');

-- Add test expense transactions
INSERT INTO transactions (date, bank, type, category_id, amount, description) VALUES
(CURRENT_DATE - INTERVAL '28 days', 'nubank', 'expense', (SELECT id FROM categories WHERE name = 'Equipment' LIMIT 1), 800.00, 'New Camera Lens'),
(CURRENT_DATE - INTERVAL '23 days', 'c6', 'expense', (SELECT id FROM categories WHERE name = 'Travel' LIMIT 1), 300.00, 'Travel Expenses - Wedding Coverage'),
(CURRENT_DATE - INTERVAL '18 days', 'mercadopago', 'expense', (SELECT id FROM categories WHERE name = 'Marketing' LIMIT 1), 250.00, 'Social Media Advertising'),
(CURRENT_DATE - INTERVAL '14 days', 'nubank', 'expense', (SELECT id FROM categories WHERE name = 'Equipment' LIMIT 1), 450.00, 'Lighting Equipment'),
(CURRENT_DATE - INTERVAL '11 days', 'c6', 'expense', (SELECT id FROM categories WHERE name = 'Travel' LIMIT 1), 200.00, 'Fuel Expenses'),
(CURRENT_DATE - INTERVAL '9 days', 'mercadopago', 'expense', (SELECT id FROM categories WHERE name = 'Marketing' LIMIT 1), 350.00, 'Website Maintenance'),
(CURRENT_DATE - INTERVAL '7 days', 'nubank', 'expense', (SELECT id FROM categories WHERE name = 'Equipment' LIMIT 1), 600.00, 'Camera Maintenance'),
(CURRENT_DATE - INTERVAL '5 days', 'c6', 'expense', (SELECT id FROM categories WHERE name = 'Travel' LIMIT 1), 280.00, 'Travel Expenses - Corporate Event'),
(CURRENT_DATE - INTERVAL '3 days', 'mercadopago', 'expense', (SELECT id FROM categories WHERE name = 'Marketing' LIMIT 1), 150.00, 'Business Cards'),
(CURRENT_DATE - INTERVAL '1 day', 'nubank', 'expense', (SELECT id FROM categories WHERE name = 'Equipment' LIMIT 1), 900.00, 'New Tripod and Accessories');