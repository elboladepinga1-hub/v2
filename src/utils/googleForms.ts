import { db } from './firebaseClient';
import { addDoc, collection } from 'firebase/firestore';

interface GoogleFormData {
  clientName: string;
  eventType: string;
  packageId: string;
  eventDate: string;
  contractDate: string;
  totalAmount: number;
  travelFee: number;
  paymentMethod: string;
  teamMemberId: string;
}

export const syncGoogleFormData = async (formData: GoogleFormData) => {
  try {
    const contractRef = await addDoc(collection(db, 'contracts'), {
      client_name: formData.clientName,
      event_type: formData.eventType,
      package_id: formData.packageId,
      event_date: formData.eventDate,
      contract_date: formData.contractDate,
      total_amount: formData.totalAmount,
      travel_fee: formData.travelFee,
      payment_method: formData.paymentMethod,
      team_member_id: formData.teamMemberId,
      created_at: new Date().toISOString()
    });

    const depositAmount = formData.totalAmount * 0.2;
    await addDoc(collection(db, 'transactions'), {
      date: formData.contractDate,
      team_member_id: formData.teamMemberId,
      bank: 'nubank',
      type: 'income',
      category_id: 'events',
      amount: depositAmount,
      description: `Initial deposit for ${formData.eventType} - ${formData.clientName}`,
      contract_id: contractRef.id,
      created_at: new Date().toISOString()
    });

    return { id: contractRef.id } as any;
  } catch (error) {
    console.error('Error syncing Google Form data:', error);
    throw error;
  }
};
