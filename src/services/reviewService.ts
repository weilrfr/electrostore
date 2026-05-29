import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
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
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
    
    // Сортируем отзывы по дате создания (новые сверху) на клиенте,
    // чтобы избежать необходимости создавать составной индекс в Firestore
    reviews.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() ?? 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() ?? 0;
      return bTime - aTime;
    });
    
    return reviews;
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

  try {
    // Получаем текущие данные о рейтинге товара
    const productRef = doc(db, 'products', review.productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const productData = productSnap.data();
      const currentReviews = productData.reviews || 0;
      const currentRating = productData.rating || 0;

      // Вычисляем новый средний рейтинг
      const newReviewsCount = currentReviews + 1;
      const newRating = ((currentRating * currentReviews) + review.rating) / newReviewsCount;

      // Обновляем рейтинг и количество отзывов у товара
      await updateDoc(productRef, {
        reviews: newReviewsCount,
        rating: parseFloat(newRating.toFixed(1)),
      });
    }
  } catch (error) {
    console.error('Failed to update product review stats:', error);
  }

  return ref.id;
};

export const markAsHelpful = async (reviewId: string): Promise<void> => {
  await updateDoc(doc(db, 'reviews', reviewId), { helpful: increment(1) });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await deleteDoc(doc(db, 'reviews', reviewId));
};
