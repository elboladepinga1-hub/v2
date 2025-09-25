import { db } from './firebaseClient';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

export type PackageType = 'portrait' | 'maternity' | 'events';

export interface DBPackage {
  id: string;
  type: PackageType;
  title: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  image_url: string;
  category?: string;
  created_at?: any;
  // optional/admin-only fields that some UIs expect
  active?: boolean;
  sections?: string[];
}

const COLLECTION = 'packages';

function normalizePackage(id: string, data: any): DBPackage {
  const features = Array.isArray(data?.features)
    ? data.features.map((x: any) => String(x)).filter(Boolean)
    : [];
  const sections = Array.isArray(data?.sections)
    ? data.sections.map((x: any) => String(x)).filter(Boolean)
    : undefined;
  return {
    id,
    type: (data?.type ?? 'portrait') as PackageType,
    title: String(data?.title ?? ''),
    price: Number(data?.price ?? 0),
    duration: String(data?.duration ?? ''),
    description: String(data?.description ?? ''),
    features,
    image_url: String(data?.image_url ?? ''),
    category: data?.category ? String(data.category) : undefined,
    created_at: data?.created_at ?? undefined,
    active: typeof data?.active === 'boolean' ? data.active : undefined,
    sections,
  };
}

export async function fetchPackages(type?: PackageType): Promise<DBPackage[]> {
  const base = collection(db, COLLECTION);
  const q = type
    ? query(base, where('type', '==', type))
    : base;
  // Try to order by created_at if present, else default order
  const snap = await getDocs(q);
  const items = snap.docs.map(d => normalizePackage(d.id, d.data()));
  return items;
}

export async function createPackage(pkg: Omit<DBPackage, 'id' | 'created_at'>): Promise<DBPackage> {
  const payload: any = {
    type: pkg.type,
    title: pkg.title,
    price: Number(pkg.price) || 0,
    duration: pkg.duration || '',
    description: pkg.description || '',
    features: Array.isArray(pkg.features) ? pkg.features : [],
    image_url: pkg.image_url || '',
    created_at: serverTimestamp(),
  };
  if (pkg.category) payload.category = pkg.category;
  if (typeof (pkg as any).active === 'boolean') payload.active = (pkg as any).active;
  if (Array.isArray((pkg as any).sections)) payload.sections = (pkg as any).sections;

  const ref = await addDoc(collection(db, COLLECTION), payload);
  return { id: ref.id, ...payload } as DBPackage;
}

export async function updatePackage(id: string, updates: Partial<DBPackage>): Promise<void> {
  const payload: any = { ...updates };
  delete payload.id;
  // Ensure types
  if ('price' in payload) payload.price = Number(payload.price) || 0;
  if ('features' in payload && !Array.isArray(payload.features)) payload.features = [];
  if ('sections' in payload && !Array.isArray(payload.sections)) delete payload.sections;
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deletePackage(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
