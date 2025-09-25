import { db } from './firebaseClient';
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from 'firebase/firestore';

export interface Review {
  id: string;
  name: string;
  event?: string;
  text: string;
  rating?: number;
  image?: string;
  created_at?: any;
  active?: boolean;
}

const COLLECTION = 'reviews';

function normalizeReview(id: string, data: any): Review {
  return {
    id,
    name: String(data?.name ?? ''),
    event: data?.event ? String(data.event) : undefined,
    text: String(data?.text ?? ''),
    rating: typeof data?.rating === 'number' ? data.rating : undefined,
    image: data?.image ? String(data.image) : undefined,
    created_at: data?.created_at ?? undefined,
    active: typeof data?.active === 'boolean' ? data.active : undefined,
  };
}

export async function fetchReviews(): Promise<Review[]> {
  const base = collection(db, COLLECTION);
  let q = query(base, orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => normalizeReview(d.id, d.data()));
  // If an "active" flag exists and is false, filter out
  return items.filter(r => (typeof r.active === 'boolean' ? r.active : true));
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<void> {
  const payload: any = { ...updates };
  delete payload.id;
  await updateDoc(doc(db, COLLECTION, id), payload);
}
