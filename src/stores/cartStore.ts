import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Product } from '@/types';

const CART_KEY = 'technomarket_cart';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromStorage());

  // ─── Computed ──────────────────────────────────────────────────────────────

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => {
      const price = item.discountPrice ?? item.price;
      return sum + price * item.quantity;
    }, 0),
  );

  // ─── Actions ───────────────────────────────────────────────────────────────

  const addItem = (product: Product, quantity = 1): void => {
    const existing = items.value.find((i) => i.productId === product.id);
    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, product.stock);
      existing.quantity = newQty;
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
    saveToStorage();
  };

  const removeItem = (productId: string): void => {
    items.value = items.value.filter((i) => i.productId !== productId);
    saveToStorage();
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    const item = items.value.find((i) => i.productId === productId);
    if (!item) return;
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      item.quantity = Math.min(quantity, item.stock);
      saveToStorage();
    }
  };

  const clearCart = (): void => {
    items.value = [];
    localStorage.removeItem(CART_KEY);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function saveToStorage(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items.value));
  }

  function loadFromStorage(): CartItem[] {
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
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
});
