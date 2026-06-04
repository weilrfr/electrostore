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
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Category, ProductFilter } from "@/types";

const productsRef = collection(db, "products");
const categoriesRef = collection(db, "categories");

// ─── Получение товаров с фильтрацией ──────────────────────────────────────────

export const getProducts = async (
  filters: ProductFilter = {},
  pageSize = 12,
  lastDoc?: QueryDocumentSnapshot,
): Promise<{ products: Product[]; lastDoc: QueryDocumentSnapshot | null }> => {
  // Если есть фильтр по категории — делаем простой запрос без orderBy
  // чтобы не требовались составные индексы Firestore
  let q = query(productsRef);

  if (filters.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters.subcategory) {
    q = query(q, where("subcategory", "==", filters.subcategory));
  }

  // orderBy применяем только если нет фильтров по полям (чтобы не нужны были индексы)
  // При наличии category/subcategory сортируем на клиенте
  const hasFieldFilter = !!(
    filters.category ||
    filters.subcategory ||
    filters.minRating
  );

  if (!hasFieldFilter) {
    switch (filters.sortBy) {
      case "price_asc":
      case "price_desc":
        q = query(
          q,
          orderBy("price", filters.sortBy === "price_asc" ? "asc" : "desc"),
        );
        break;
      case "rating":
        q = query(q, orderBy("rating", "desc"));
        break;
      default:
        q = query(q, orderBy("createdAt", "desc"));
    }
  }

  if (!hasFieldFilter && lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  // Запрашиваем больше чтобы после клиентской фильтрации осталось достаточно
  const fetchLimit = hasFieldFilter ? 200 : pageSize;
  q = query(q, limit(fetchLimit));

  const snapshot = await getDocs(q);
  let products = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Product,
  );

  // Клиентская фильтрация
  if (filters.minRating) {
    products = products.filter((p) => p.rating >= filters.minRating!);
  }
  if (filters.minPrice !== undefined) {
    products = products.filter(
      (p) => (p.discountPrice ?? p.price) >= filters.minPrice!,
    );
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter(
      (p) => (p.discountPrice ?? p.price) <= filters.maxPrice!,
    );
  }
  if (filters.search) {
    const q2 = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q2) ||
        p.description.toLowerCase().includes(q2) ||
        p.tags.some((t) => t.toLowerCase().includes(q2)),
    );
  }

  // Клиентская сортировка при наличии field-фильтров
  if (hasFieldFilter) {
    switch (filters.sortBy) {
      case "price_asc":
        products.sort(
          (a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price),
        );
        break;
      case "price_desc":
        products.sort(
          (a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price),
        );
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // newest — сортируем по createdAt если есть
        products.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return bTime - aTime;
        });
    }
    // Применяем пагинацию на клиенте
    let startIndex = 0;
    if (lastDoc) {
      const idx = products.findIndex((p) => p.id === lastDoc.id);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }
    const slicedProducts = products.slice(startIndex, startIndex + pageSize);

    // Находим snapshot для последнего элемента в slicedProducts
    let last: QueryDocumentSnapshot | null = null;
    if (slicedProducts.length > 0) {
      const lastProduct = slicedProducts[slicedProducts.length - 1];
      const docSnap = snapshot.docs.find((d) => d.id === lastProduct.id);
      if (docSnap) {
        last = docSnap;
      }
    }

    return { products: slicedProducts, lastDoc: last };
  }

  const last = hasFieldFilter
    ? null
    : (snapshot.docs[snapshot.docs.length - 1] ?? null);
  return { products, lastDoc: last };
};

// ─── Получение товара по ID ───────────────────────────────────────────────────

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const snap = await getDoc(doc(db, "products", id));
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
  // Без orderBy чтобы не требовался индекс
  const q = query(
    productsRef,
    where("category", "==", category),
    limit(limitCount + 1),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Product)
    .filter((p) => p.id !== productId)
    .slice(0, limitCount);
};

// ─── Избранные товары ─────────────────────────────────────────────────────────

export const getFeaturedProducts = async (
  limitCount = 8,
): Promise<Product[]> => {
  const q = query(
    productsRef,
    where("featured", "==", true),
    limit(limitCount),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
};

// ─── Категории ────────────────────────────────────────────────────────────────

export const getCategories = async (): Promise<Category[]> => {
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
};

// ─── CRUD для администратора ──────────────────────────────────────────────────

export const createProduct = async (
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<string> => {
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
  data: Partial<Omit<Product, "id" | "createdAt">>,
): Promise<void> => {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  await updateDoc(doc(db, "products", id), {
    ...cleanData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};
