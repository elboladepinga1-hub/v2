export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  active?: boolean;
  allow_name?: boolean;
  allow_custom_image?: boolean;
  variants?: { name: string; priceDelta?: number; price?: number }[];
  tieneVariantes?: boolean;
  variantes?: { nombre: string; precio: number }[];
  permiteTexto?: boolean;
  permiteFoto?: boolean;
  permiteAudio?: boolean;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  image_url: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'package';
  quantity: number;
  price: number;
  name: string;
}

export interface StoreCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  description?: string;
}
