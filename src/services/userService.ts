import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { User, Address, WalletTransaction, TopupRequest } from '@/types';

// ─── Профиль пользователя ─────────────────────────────────────────────────────

export const getUserById = async (userId: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { uid: userId, ...snap.data() } as User;
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'preferences'>>,
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), data);
};

// ─── Загрузка аватара ─────────────────────────────────────────────────────────

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const avatarRef = storageRef(storage, `avatars/${userId}`);
  await uploadBytes(avatarRef, file);
  const url = await getDownloadURL(avatarRef);
  await updateDoc(doc(db, 'users', userId), { avatar: url });
  return url;
};

// ─── Адреса ───────────────────────────────────────────────────────────────────

export const addAddress = async (userId: string, address: Address): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const addresses: Address[] = userSnap.data().addresses ?? [];
  // Если первый адрес — ставим по умолчанию
  const newAddress = { ...address, isDefault: addresses.length === 0 ? true : address.isDefault };
  await updateDoc(userRef, { addresses: arrayUnion(newAddress) });
};

export const updateAddress = async (
  userId: string,
  updatedAddress: Address,
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const addresses: Address[] = userSnap.data().addresses ?? [];
  const newAddresses = addresses.map((a) => (a.id === updatedAddress.id ? updatedAddress : a));
  await updateDoc(userRef, { addresses: newAddresses });
};

export const deleteAddress = async (userId: string, address: Address): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), { addresses: arrayRemove(address) });
};

export const setDefaultAddress = async (userId: string, addressId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const addresses: Address[] = userSnap.data().addresses ?? [];
  const newAddresses = addresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
  await updateDoc(userRef, { addresses: newAddresses });
};

// ─── Кошелёк ──────────────────────────────────────────────────────────────────

export const getWalletTransactions = async (userId: string): Promise<WalletTransaction[]> => {
  const q = query(
    collection(db, 'walletTransactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WalletTransaction));
};

// ─── Запросы на пополнение ────────────────────────────────────────────────────

export const createTopupRequest = async (
  userId: string,
  userEmail: string,
  userName: string,
  amount: number,
): Promise<void> => {
  await addDoc(collection(db, 'topupRequests'), {
    userId,
    userEmail,
    userName,
    amount,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getAllTopupRequests = async (): Promise<TopupRequest[]> => {
  const q = query(collection(db, 'topupRequests'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TopupRequest));
};

export const approveTopupRequest = async (
  requestId: string,
  userId: string,
  amount: number,
): Promise<void> => {
  const requestRef = doc(db, 'topupRequests', requestId);
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error('Пользователь не найден');

    const currentBalance: number = userSnap.data().balance ?? 0;
    transaction.update(userRef, { balance: currentBalance + amount });
    transaction.update(requestRef, { status: 'approved', updatedAt: serverTimestamp() });

    const txRef = doc(collection(db, 'walletTransactions'));
    transaction.set(txRef, {
      userId,
      type: 'topup',
      amount,
      description: 'Пополнение баланса (одобрено администратором)',
      createdAt: serverTimestamp(),
    });
  });
};

export const rejectTopupRequest = async (requestId: string): Promise<void> => {
  await updateDoc(doc(db, 'topupRequests', requestId), {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
};

// ─── Статистика для дашборда ──────────────────────────────────────────────────

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as User));
};
