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
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, Category, ProductFilter } from '@/types';

const productsRef = collection(db, 'products');
const categoriesRef = collection(db, 'categories');

// ─── Получение товаров с фильтрацией ──────────────────────────────────────────

export const getProducts = async (
  filters: ProductFilter = {},
  pageSize = 12,
  lastDoc?: QueryDocumentSnapshot,
): Promise<{ products: Product[]; lastDoc: QueryDocumentSnapshot | null }> => {
  let q = query(productsRef);

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters.subcategory) {
    q = query(q, where('subcategory', '==', filters.subcategory));
  }
  if (filters.minRating) {
    q = query(q, where('rating', '>=', filters.minRating));
  }

  // Сортировка
  switch (filters.sortBy) {
    case 'price_asc':
      q = query(q, orderBy('price', 'asc'));
      break;
    case 'price_desc':
      q = query(q, orderBy('price', 'desc'));
      break;
    case 'rating':
      q = query(q, orderBy('rating', 'desc'));
      break;
    default:
      q = query(q, orderBy('createdAt', 'desc'));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  q = query(q, limit(pageSize));

  const snapshot = await getDocs(q);
  let products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));

  // Клиентская фильтрация по цене (Firestore не поддерживает range на нескольких полях)
  if (filters.minPrice !== undefined) {
    products = products.filter((p) => (p.discountPrice ?? p.price) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => (p.discountPrice ?? p.price) <= filters.maxPrice!);
  }
  // Поиск по названию
  if (filters.search) {
    const q2 = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q2) ||
        p.description.toLowerCase().includes(q2) ||
        p.tags.some((t) => t.toLowerCase().includes(q2)),
    );
  }

  const last = snapshot.docs[snapshot.docs.length - 1] ?? null;
  return { products, lastDoc: last };
};

// ─── Получение товара по ID ───────────────────────────────────────────────────

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (!snap.exists()) {
      console.warn(`Product document not found: ${id}`);
      return null;
    }
    return { id: snap.id, ...snap.data() } as Product;
  } catch (error) {
    console.error(`Error loading product ${id}:`, error);
    throw error;
  }
};

// ─── Рекомендованные товары ───────────────────────────────────────────────────

export const getRelatedProducts = async (
  productId: string,
  category: string,
  limitCount = 4,
): Promise<Product[]> => {
  const q = query(
    productsRef,
    where('category', '==', category),
    orderBy('rating', 'desc'),
    limit(limitCount + 1),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Product))
    .filter((p) => p.id !== productId)
    .slice(0, limitCount);
};

// ─── Избранные товары ─────────────────────────────────────────────────────────

export const getFeaturedProducts = async (limitCount = 8): Promise<Product[]> => {
  const q = query(productsRef, where('featured', '==', true), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
};

// ─── Категории ────────────────────────────────────────────────────────────────

export const getCategories = async (): Promise<Category[]> => {
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};

// ─── CRUD для администратора ──────────────────────────────────────────────────

export const createProduct = async (
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  // Удаляем все undefined значения перед отправкой в Firestore
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  const ref = await addDoc(productsRef, {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
): Promise<void> => {
  // Удаляем все undefined значения перед отправкой в Firestore
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  await updateDoc(doc(db, 'products', id), { ...cleanData, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', id));
};
