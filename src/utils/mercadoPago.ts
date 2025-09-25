interface MercadoPagoItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer: {
    name: string;
    email: string;
    phone?: {
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  external_reference: string;
  notification_url?: string;
}

import { httpsCallable } from 'firebase/functions';
import { functions, firebaseProjectId } from './firebaseClient';

export class MercadoPagoService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.PROD
      ? window.location.origin
      : 'http://localhost:5173';
  }

  async createPreference(bookingData: any): Promise<{ id: string; init_point: string }> {
    try {
      // Calculate total amount
      const servicesTotal = (bookingData.cartItems || []).reduce((sum: number, item: any) => {
        const itemPrice = Number(item.price.replace(/[^0-9]/g, ''));
        const itemTotal = itemPrice * item.quantity;
        
        // Apply coupon discounts
        const coupon = bookingData[`discountCoupon_${bookingData.cartItems?.indexOf(item)}`];
        if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
          return sum; // FREE coupon makes the item free
        }
        
        return sum + itemTotal;
      }, 0);

      const storeTotal = (bookingData.storeItems || []).reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0);

      const subtotal = servicesTotal + storeTotal + (bookingData.travelCost || 0);
      const paymentDiscount = bookingData.paymentMethod === 'cash' ? Math.round(subtotal * 0.05) : 0;
      const totalAmount = subtotal - paymentDiscount;

      // Calculate deposit (20% of services + 50% of store items)
      const servicesDeposit = Math.round(servicesTotal * 0.2);
      const storeDeposit = Math.round(storeTotal * 0.5);
      const depositAmount = servicesDeposit + storeDeposit;

      // Prepare items for Mercado Pago
      const items: MercadoPagoItem[] = [];

      // Add deposit item
      if (depositAmount > 0) {
        items.push({
          title: `Sinal - Wild Pictures Studio (${bookingData.eventType})`,
          quantity: 1,
          unit_price: depositAmount,
          currency_id: 'BRL'
        });
      }

      // If no deposit (store only), add full amount
      if (depositAmount === 0 && totalAmount > 0) {
        items.push({
          title: `Serviços Adicionais - Wild Pictures Studio`,
          quantity: 1,
          unit_price: totalAmount,
          currency_id: 'BRL'
        });
      }

      const preference: MercadoPagoPreference = {
        items,
        payer: {
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone ? {
            number: bookingData.phone.replace(/\D/g, '')
          } : undefined
        },
        back_urls: {
          success: `${this.baseUrl}/booking?payment=success`,
          failure: `${this.baseUrl}/booking?payment=failure`,
          pending: `${this.baseUrl}/booking?payment=pending`
        },
        auto_return: 'approved',
        external_reference: `booking_${Date.now()}`,
        notification_url: `https://us-central1-${firebaseProjectId}.cloudfunctions.net/mpWebhook`
      };

      // Call Firebase Callable Function (mpCreatePreference)
      const call = httpsCallable(functions as any, 'mpCreatePreference');
      const resp: any = await call({ preference, bookingData });
      return resp.data as { id: string; init_point: string };
    } catch (error) {
      console.error('Erro no Mercado Pago:', error);
      throw error;
    }
  }
}

export const mercadoPago = new MercadoPagoService();
