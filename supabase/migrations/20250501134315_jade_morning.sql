/*
  # Add initial store products

  This migration adds 10 initial products to the store with various categories,
  descriptions, prices and images.
*/

INSERT INTO products (name, description, price, category, image_url) VALUES
(
  'Kit de Iluminação Portátil',
  'Kit completo com 2 softboxes LED de 20W, tripés ajustáveis e bolsa de transporte. Perfeito para sessões em ambientes internos.',
  299.90,
  'equipamento',
  'https://images.pexels.com/photos/1051544/pexels-photo-1051544.jpeg'
),
(
  'Álbum Fotográfico Premium',
  'Álbum de capa dura personalizado com 20 páginas em papel fotográfico premium, tamanho 25x25cm.',
  189.90,
  'album',
  'https://images.pexels.com/photos/5935228/pexels-photo-5935228.jpeg'
),
(
  'Conjunto de Fundos Fotográficos',
  'Kit com 3 fundos em tecido (preto, branco e cinza) de 2x3m, ideal para retratos em estúdio.',
  249.90,
  'equipamento',
  'https://images.pexels.com/photos/1655817/pexels-photo-1655817.jpeg'
),
(
  'Mini Impressora Fotográfica',
  'Impressora portátil para fotos instantâneas, conexão bluetooth, ideal para eventos.',
  399.90,
  'equipamento',
  'https://images.pexels.com/photos/3850526/pexels-photo-3850526.jpeg'
),
(
  'Conjunto de Acessórios para Gestante',
  'Kit com coroa de flores, faixa de cetim e props para fotos. Perfeito para ensaios de gestante.',
  159.90,
  'acessorios',
  'https://images.pexels.com/photos/3662503/pexels-photo-3662503.jpeg'
),
(
  'Quadro Personalizado',
  'Quadro em canvas premium com moldura, tamanho 40x60cm. Impressão em alta qualidade da sua foto favorita.',
  229.90,
  'decoracao',
  'https://images.pexels.com/photos/1668928/pexels-photo-1668928.jpeg'
),
(
  'Kit Newborn',
  'Conjunto completo para fotos newborn com wrap, headband, manta e props temáticos.',
  179.90,
  'acessorios',
  'https://images.pexels.com/photos/3875080/pexels-photo-3875080.jpeg'
),
(
  'Álbum Digital Luxo',
  'Álbum digital em formato PDF de alta resolução com 50 páginas personalizadas e design exclusivo.',
  149.90,
  'album',
  'https://images.pexels.com/photos/5935228/pexels-photo-5935228.jpeg'
),
(
  'Kit Festa Premium',
  'Conjunto de props e acessórios para festas, incluindo letreiro luminoso, balões metálicos e backdrop.',
  289.90,
  'acessorios',
  'https://images.pexels.com/photos/1405766/pexels-photo-1405766.jpeg'
),
(
  'Porta-Retratos Trio',
  'Conjunto com 3 porta-retratos em metal escovado, tamanhos variados (10x15, 15x20, 20x25cm).',
  139.90,
  'decoracao',
  'https://images.pexels.com/photos/1668928/pexels-photo-1668928.jpeg'
);