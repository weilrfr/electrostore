import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, Category, ProductFilter } from '@/types';
import { getProducts, getCategories, getFeaturedProducts } from '@/services/productService';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const featuredProducts = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const filters = ref<ProductFilter>({});
  let lastDoc: QueryDocumentSnapshot | null = null;

  // ─── Computed ──────────────────────────────────────────────────────────────

  const categoryMap = computed<Record<string, Category>>(() =>
    Object.fromEntries(categories.value.map((c) => [c.slug, c])),
  );

  // ─── Actions ───────────────────────────────────────────────────────────────

  const fetchProducts = async (newFilters?: ProductFilter, reset = true): Promise<void> => {
    if (newFilters) filters.value = newFilters;
    if (reset) {
      products.value = [];
      lastDoc = null;
      hasMore.value = true;
    }
    if (!hasMore.value) return;

    loading.value = true;
    try {
      const result = await getProducts(filters.value, 12, lastDoc ?? undefined);
      products.value = reset ? result.products : [...products.value, ...result.products];
      lastDoc = result.lastDoc;
      hasMore.value = result.products.length === 12;
    } finally {
      loading.value = false;
    }
  };

  const fetchMore = (): Promise<void> => fetchProducts(undefined, false);

  const fetchFeatured = async (): Promise<void> => {
    featuredProducts.value = await getFeaturedProducts(8);
  };

  const fetchCategories = async (): Promise<void> => {
    if (categories.value.length > 0) return; // кэш
    categories.value = await getCategories();
  };

  const setFilters = (newFilters: ProductFilter): Promise<void> => {
    return fetchProducts(newFilters, true);
  };

  const resetFilters = (): Promise<void> => {
    return fetchProducts({}, true);
  };

  return {
    products,
    featuredProducts,
    categories,
    loading,
    hasMore,
    filters,
    categoryMap,
    fetchProducts,
    fetchMore,
    fetchFeatured,
    fetchCategories,
    setFilters,
    resetFilters,
  };
});
