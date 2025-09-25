export interface EventPackageType {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  image: string;
}

export const eventPackages: EventPackageType[] = [
  {
    id: 'prewedding-basic',
    title: 'Ensaio Pré-Wedding Básico',
    price: 'R$ 400',
    duration: '1 horas',
    description: 'Ensaio fotográfico romântico para casais em locação externa.',
    features: [
      'Ensaio em locação externa',
      '30 fotos editadas',
      'Entregue via Google Fotos ',
      'Entrega em 10 dias'
    ],
    image: 'https://images.pexels.com/photos/1485956/pexels-photo-1485956.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  // {
  //   id: 'prewedding-premium',
  //   title: 'Ensaio Pré-Wedding Premium',
  //   price: 'R$ 1.200',
  //   duration: '3 horas',
  //   description: 'Ensaio completo com múltiplas locações e looks variados.',
  //   features: [
  //     'Ensaio em 2 locações diferentes',
  //     'Troca de looks incluída',
  //     '80 fotos editadas',
  //     'Galeria digital premium',
  //     '10 fotos impressas (15x21cm)',
  //     'Mini álbum (20x20cm)',
  //     'Entrega em 15 dias'
  //   ],
  //   image: 'https://images.pexels.com/photos/842822/pexels-photo-842822.jpeg?auto=compress&cs=tinysrgb&w=1600'
  // },
  //{
    //id: 'prewedding-exclusive',
    //title: 'Ensaio Pré-Wedding Exclusivo',
    //price: 'R$ 1.800',
    //duration: '4 horas',
    //description: 'Experiência fotográfica completa com produção profissional.',
    //features: [
      //'Ensaio em 3 locações exclusivas',
      //'Consultoria de styling',
      //'Make e cabelo inclusos',
      //'120 fotos editadas',
      //'Álbum premium (25x25cm)',
      //'Galeria digital exclusiva',
      //'Entrega em 7 dias'
    //],
    //image: 'https://images.pexels.com/photos/3584440/pexels-photo-3584440.jpeg?auto=compress&cs=tinysrgb&w=1600'
  //},
  {
    id: 'prewedding-teaser',
    title: 'Teaser Pré-Wedding',
    price: 'R$ 200',
    duration: '1 horas',
    description: 'Vídeo teaser cinematográfico para anunciar seu casamento.',
    features: [
      'Filmagem cinematográfica',
      'Vídeo teaser (2-3 minutos)',
      'Trilha sonora personalizada',
      'Edição profissional',
      'Entrega em formato digital',
      'Entrega em 20 dias'
    ],
    image: 'https://images.pexels.com/photos/3649168/pexels-photo-3649168.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 'wedding-basic',
    title: 'Pacote Casamento Básico',
    price: 'R$ 2.000',
    duration: '7 horas',
    description: 'Cobertura total do evento.',
    features: [
      'Cobertura esde o making off até recepção',
      'Sem limite de fotos',
      'Todas as fotos são editadas',
      'Entrega em 20 dias'
    ],
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  // {
  //   id: 'wedding-premium',
  //   title: 'Pacote Casamento Premium',
  //   price: 'R$ 4.500',
  //   duration: '10 horas',
  //   description: 'Cobertura completa com dois fotógrafos para capturar todos os momentos.',
  //   features: [
  //     'Dois fotógrafos profissionais',
  //     'Making of dos noivos',
  //     'Cobertura completa (preparação, cerimônia, festa)',
  //     '500 fotos editadas',
  //     'Álbum impresso (30x30cm, 30 páginas)',
  //     'Galeria digital premium',
  //     'Entrega em 15 dias'
  //   ],
  //   image: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1600'
  // },
  // {
  //   id: 'wedding-exclusive',
  //   title: 'Pacote Casamento Exclusivo',
  //   price: 'R$ 7.900',
  //   duration: '12 horas',
  //   description: 'Experiência fotográfica completa incluindo foto e vídeo para seu dia especial.',
  //   features: [
  //     'Equipe completa (2 fotógrafos + videomaker)',
  //     'Ensaio pré-wedding incluso',
  //     'Drone para tomadas aéreas',
  //     'Vídeo highlight (5-7 minutos)',
  //     '700 fotos editadas',
  //     'Álbum de luxo (35x35cm, 40 páginas)',
  //     'Galeria digital exclusiva',
  //     'Entrega em 30 dias'
  //   ],
  //   image: 'https://images.pexels.com/photos/3649168/pexels-photo-3649168.jpeg?auto=compress&cs=tinysrgb&w=1600'
  // }
];

export const eventGalleryImages = [
  {
    id: 1,
    category: 'wedding',
    src: 'https://images.pexels.com/photos/1855211/pexels-photo-1855211.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Cerimônia de casamento'
  },
  {
    id: 2,
    category: 'wedding',
    src: 'https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Noiva preparação'
  },
  {
    id: 3,
    category: 'civil',
    src: 'https://images.pexels.com/photos/3620173/pexels-photo-3620173.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Casamento civil'
  },
  {
    id: 4,
    category: 'party',
    src: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Festa de casamento'
  },
  {
    id: 5,
    category: 'anniversary',
    src: 'https://images.pexels.com/photos/1405766/pexels-photo-1405766.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Comemoração de aniversário'
  },
  {
    id: 6,
    category: 'wedding',
    src: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Detalhes de casamento'
  }
];
