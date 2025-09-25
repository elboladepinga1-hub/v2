export interface PackageType {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  image: string;
}

export const sessionPackages: PackageType[] = [
  {
    id: 'basic',
    title: 'Sessão Básica',
    price: 'R$ 350',
    duration: '1 hora',
    description: 'Sessão fotográfica ideal para retratos individuais e pequenos ensaios.',
    features: [
      '20 fotos editadas',
      'Galeria digital',
      '5 fotos impressas (15x21cm)',
      'Entrega em 7 dias'
    ],
    image: 'https://images.pexels.com/photos/2097104/pexels-photo-2097104.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 'premium',
    title: 'Sessão Premium',
    price: 'R$ 650',
    duration: '2 horas',
    description: 'Perfeita para ensaios de família, gestantes e ensaios mais elaborados.',
    features: [
      '40 fotos editadas',
      'Galeria digital',
      '10 fotos impressas (15x21cm)',
      '1 ampliação (30x45cm)',
      'Entrega em 5 dias'
    ],
    image: 'https://images.pexels.com/photos/4946604/pexels-photo-4946604.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 'exclusive',
    title: 'Sessão Exclusiva',
    price: 'R$ 990',
    duration: '3 horas',
    description: 'Experiência completa para pré-wedding, ensaios temáticos ou especiais.',
    features: [
      '60 fotos editadas',
      'Galeria digital premium',
      '15 fotos impressas (15x21cm)',
      '2 ampliações (30x45cm)',
      'Mini álbum (15x15cm)',
      'Entrega em 3 dias'
    ],
    image: 'https://images.pexels.com/photos/3584440/pexels-photo-3584440.jpeg?auto=compress&cs=tinysrgb&w=1600'
  }
];

export const galleryImages = [
  {
    id: 1,
    category: 'portrait',
    src: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato artístico feminino'
  },
  {
    id: 2,
    category: 'family',
    src: 'https://images.pexels.com/photos/4262010/pexels-photo-4262010.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio família na natureza'
  },
  {
    id: 3,
    category: 'maternity',
    src: 'https://images.pexels.com/photos/3662503/pexels-photo-3662503.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio gestante'
  },
  {
    id: 4,
    category: 'couple',
    src: 'https://images.pexels.com/photos/842822/pexels-photo-842822.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Casal ao pôr do sol'
  },
  {
    id: 5,
    category: 'prewedding',
    src: 'https://images.pexels.com/photos/1485956/pexels-photo-1485956.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio pré-wedding'
  },
  {
    id: 6,
    category: 'portrait',
    src: 'https://images.pexels.com/photos/2698935/pexels-photo-2698935.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato masculino urbano'
  }
];