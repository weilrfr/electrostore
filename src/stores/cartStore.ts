import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Product } from '@/types';
import { getCart, saveCart, clearCartInDB } from '@/services/cartService';

const CART_KEY = 'technomarket_cart';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const currentUserId = ref<string | null>(null);
  const isInitialized = ref(false);

  // Вычисляемые свойства

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => {
      const price = item.discountPrice ?? item.price;
      return sum + price * item.quantity;
    }, 0),
  );

  // Инициализация

  const initCart = async (userId: string | null): Promise<void> => {
    // Если userId не изменился — не переинициализируем
    if (isInitialized.value && currentUserId.value === userId) return;

    currentUserId.value = userId;

    if (userId) {
      try {
        const remoteItems = await getCart(userId);
        const guestItems = loadFromLocalStorage();

        if (guestItems.length > 0) {
          const merged = mergeItems(remoteItems, guestItems);
          items.value = merged;
          await saveCart(userId, JSON.parse(JSON.stringify(merged)));
          localStorage.removeItem(CART_KEY);
        } else {
          items.value = remoteItems;
        }
      } catch (e) {
        console.error('Failed to load cart from Firestore:', e);
        items.value = loadFromLocalStorage();
      }
    } else {
      items.value = loadFromLocalStorage();
    }

    isInitialized.value = true;
  };

  const persist = async (): Promise<void> => {
    if (currentUserId.value) {
      try {
        // Избавляемся от Proxy и удаляем undefined поля (например, discountPrice), которые ломают Firestore
        const cleanItems = JSON.parse(JSON.stringify(items.value));
        await saveCart(currentUserId.value, cleanItems);
      } catch (e) {
        console.error('Failed to save cart to Firestore:', e);
      }
    } else {
      saveToLocalStorage();
    }
  };

  // Действия

  const addItem = (product: Product, quantity = 1): void => {
    const existing = items.value.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images[0] ?? '',
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
      });
    }
    persist();
  };

  const removeItem = (productId: string): void => {
    items.value = items.value.filter((i) => i.productId !== productId);
    persist();
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    const item = items.value.find((i) => i.productId === productId);
    if (!item) return;
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      item.quantity = Math.min(quantity, item.stock);
      persist();
    }
  };

  const clearCart = (): void => {
    items.value = [];
    if (currentUserId.value) {
      clearCartInDB(currentUserId.value).catch(console.error);
    } else {
      localStorage.removeItem(CART_KEY);
    }
  };

  // Вспомогательные функции

  function mergeItems(remote: CartItem[], local: CartItem[]): CartItem[] {
    const map = new Map<string, CartItem>();
    for (const item of remote) map.set(item.productId, { ...item });
    for (const item of local) {
      const existing = map.get(item.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, existing.stock);
      } else {
        map.set(item.productId, { ...item });
      }
    }
    return Array.from(map.values());
  }

  function saveToLocalStorage(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items.value));
  }

  function loadFromLocalStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  return {
    items,
    itemCount,
    subtotal,
    isInitialized,
    initCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
});