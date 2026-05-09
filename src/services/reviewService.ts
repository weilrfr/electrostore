import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Review } from '@/types';

const reviewsRef = collection(db, 'reviews');

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const q = query(
      reviewsRef,
      where('productId', '==', productId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  } catch (error) {
    console.error(`Error loading reviews for product ${productId}:`, error);
    // Возвращаем пустой массив если ошибка (отзывы не критичны)
    return [];
  }
};

export const addReview = async (
  review: Omit<Review, 'id' | 'helpful' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  const ref = await addDoc(reviewsRef, {
    ...review,
    helpful: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Обновляем рейтинг и количество отзывов у товара
  await updateDoc(doc(db, 'products', review.productId), {
    reviews: increment(1),
  });
  return ref.id;
};

export const markAsHelpful = async (reviewId: string): Promise<void> => {
  await updateDoc(doc(db, 'reviews', reviewId), { helpful: increment(1) });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await deleteDoc(doc(db, 'reviews', reviewId));
};
