export interface BookingFormData {
  // Personal Information
  name: string;
  cpf: string;
  rg: string;
  address: string;
  email: string;
  phone: string;
  
  // Service Information
  serviceType: string;
  packageId: string;
  quantity: number;
  selectedDresses: string[];
  
  // Event Details
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  
  // Financial
  travelCost: number;
  paymentMethod: PaymentMethod;
  discountCoupon: string;
  
  // Additional
  message: string;
  
  // Cart Items
  cartItems?: CartItem[];
  storeItems?: StoreCartItem[];
  
  // Dynamic fields for multiple services
  [key: string]: any;
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  duration: string;
  type: string;
  quantity: number;
  image: string;
  features?: string[];
}

export interface StoreCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  custom_text?: string;
}

export type PaymentMethod = 'cash' | 'credit' | 'pix';