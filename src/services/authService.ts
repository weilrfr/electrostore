import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '@/types';

// Вход

export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<FirebaseUser> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// Регистрация

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const registerWithEmail = async (data: RegisterData): Promise<FirebaseUser> => {
  const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const { user } = credential;

  // Создаём профиль в Firestore
  const userDoc: Omit<User, 'uid'> = {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: 'customer',
    balance: 0,
    addresses: [],
    createdAt: serverTimestamp() as User['createdAt'],
    preferences: {
      notifications: true,
      newsletter: false,
    },
  };

  await setDoc(doc(db, 'users', user.uid), userDoc);
  return user;
};

// Выход

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Сброс пароля

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Получение профиля

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as User;
};

// Слушатель авторизации

export const onAuthChange = (
  callback: (user: FirebaseUser | null) => void,
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// Маппинг ошибок Firebase

export const getAuthErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'Пользователь с таким email не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/email-already-in-use': 'Этот email уже зарегистрирован',
    'auth/weak-password': 'Пароль слишком простой (минимум 6 символов)',
    'auth/invalid-email': 'Некорректный формат email',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение',
    'auth/invalid-credential': 'Неверный email или пароль',
  };
  return messages[code] ?? 'Произошла ошибка. Попробуйте снова';
};
