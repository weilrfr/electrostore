import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CartItem } from '@/types';

const cartDocRef = (userId: string) => doc(db, 'carts', userId);

export const getCart = async (userId: string): Promise<CartItem[]> => {
  const snap = await getDoc(cartDocRef(userId));
  if (!snap.exists()) return [];
  const data = snap.data();
  return (data.items as CartItem[]) ?? [];
};

export const saveCart = async (userId: string, items: CartItem[]): Promise<void> => {
  await setDoc(cartDocRef(userId), { items }, { merge: true });
};

export const clearCartInDB = async (userId: string): Promise<void> => {
  await setDoc(cartDocRef(userId), { items: [] });
};