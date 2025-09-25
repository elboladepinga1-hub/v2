import { DressOption } from '../types/booking';

export interface MaternityPackageType {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  image: string;
  looks: number;
}

export const maternityPackages: MaternityPackageType[] = [
  {
    id: 'maternity-gold',
    title: 'GOLD',
    price: 'R$200',
    duration: '30 min ensaio',
    description: '',
    features: [
      '1 figurino',
      '10 fotos digitais',
      '30 min ensaio',
      'Apenas 2 pessoas + filhos.',
      'Fotos apenas no estúdio.'
    ],
    image: 'https://images.pexels.com/photos/4253831/pexels-photo-4253831.jpeg?auto=compress&cs=tinysrgb&w=1600',
    looks: 1
  },
  {
    id: 'maternity-platinum',
    title: 'PLATINUM',
    price: 'R$400',
    duration: '1:30 min ensaio',
    description: '',
    features: [
      '3 figurinos',
      '30 fotos digitais',
      '1:30 min ensaio',
      'Pode participar a família toda.',
      'Maquiagem incluso.',
      'Fotos externas ou no estúdio.'
    ],
    image: 'https://images.pexels.com/photos/3951843/pexels-photo-3951843.jpeg?auto=compress&cs=tinysrgb&w=1600',
    looks: 3
  },
  {
    id: 'maternity-diamond',
    title: 'DIAMOND',
    price: 'R$250',
    duration: 'Até 45 min ensaio',
    description: '',
    features: [
      '2 figurinos',
      '20 fotos digitais',
      'Até 45 min ensaio',
      'Pode participar a família toda nas fotos externas.',
      'Fotos externas ou no estúdio.'
    ],
    image: 'https://images.pexels.com/photos/3992658/pexels-photo-3992658.jpeg?auto=compress&cs=tinysrgb&w=1600',
    looks: 2
  }
];
