import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseClient';
import { BookingFormData } from '../types/booking';

export interface ContractData {
  clientName: string;
  clientEmail: string;
  eventType: string;
  eventDate: string;
  contractDate: string;
  totalAmount: number;
  travelFee: number;
  paymentMethod: string;
  depositPaid: boolean;
  finalPaymentPaid: boolean;
  eventCompleted: boolean;
  packageTitle?: string;
  packageDuration?: string;
  eventLocation?: string;
  eventTime?: string;
  services?: any[];
  storeItems?: any[];
  message?: string;
  createdAt: string;
  pdfUrl?: string;
  formSnapshot?: BookingFormData;
}

export interface OrderData {
  clientName: string;
  clientEmail: string;
  items: any[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: string;
  contractId?: string;
  createdAt: string;
}

export const saveContract = async (formData: BookingFormData): Promise<string> => {
  try {
    // Calculate total amount
    const servicesTotal = formData.cartItems?.reduce((sum, item) => {
      const itemPrice = Number(item.price.replace(/[^0-9]/g, ''));
      const itemTotal = itemPrice * item.quantity;
      
      // Apply coupon discounts
      const coupon = formData[`discountCoupon_${formData.cartItems?.indexOf(item)}`];
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        return sum; // FREE coupon makes the item free
      }
      
      return sum + itemTotal;
    }, 0) || 0;

    const storeTotal = formData.storeItems?.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0) || 0;

    const subtotal = servicesTotal + storeTotal + formData.travelCost;
    const paymentDiscount = formData.paymentMethod === 'cash' ? subtotal * 0.05 : 0;
    const totalAmount = subtotal - paymentDiscount;

    // Prepare contract data
    const contractData: ContractData = {
      clientName: formData.name,
      clientEmail: formData.email,
      eventType: formData.cartItems?.[0]?.type === 'events' ? 'Eventos' : 
                 formData.cartItems?.[0]?.type === 'portrait' ? 'Retratos' : 'Gestantes',
      eventDate: formData.cartItems?.[0] ? formData[`date_0`] || '' : '',
      contractDate: new Date().toISOString().split('T')[0],
      totalAmount,
      travelFee: formData.travelCost,
      paymentMethod: formData.paymentMethod,
      depositPaid: false,
      finalPaymentPaid: false,
      eventCompleted: false,
      packageTitle: formData.cartItems?.[0]?.name || '',
      packageDuration: formData.cartItems?.[0]?.duration || '',
      eventLocation: formData.cartItems?.[0] ? formData[`eventLocation_0`] || '' : '',
      eventTime: formData.cartItems?.[0] ? formData[`time_0`] || '' : '',
      services: formData.cartItems || [],
      storeItems: formData.storeItems || [],
      message: formData.message,
      createdAt: new Date().toISOString()
    };

    // Save to Firebase
    const docRef = await addDoc(collection(db, 'contracts'), {
      ...contractData,
      formSnapshot: formData
    });

    // If there are store items, also create an order record
    if ((formData.storeItems?.length || 0) > 0) {
      const orderData: OrderData = {
        clientName: formData.name,
        clientEmail: formData.email,
        items: formData.storeItems || [],
        totalAmount: storeTotal,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        contractId: docRef.id,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'orders'), orderData);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error saving contract:', error);
    throw error;
  }
};

export const updateContractStatus = async (contractId: string, updates: Partial<ContractData>) => {
  try {
    const contractRef = doc(db, 'contracts', contractId);
    await updateDoc(contractRef, updates);
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
};
