<script setup lang="ts">
import { computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import CartItem from '@/components/cart/CartItem.vue';
import { formatPrice } from '@/utils';
import { SHIPPING_COST } from '@/utils';

const cartStore = useCartStore();
const authStore = useAuthStore();

const subtotal = computed(() => cartStore.subtotal);
const shipping = computed(() => (subtotal.value > 0 ? SHIPPING_COST : 0));
const total = computed(() => subtotal.value + shipping.value);
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="page-title mb-8">Корзина</h1>

    <!-- Empty cart -->
    <div v-if="cartStore.items.length === 0" class="text-center py-20">
      <div class="text-7xl mb-4">🛒</div>
      <p class="text-xl font-medium text-gray-700 mb-2">Корзина пуста</p>
      <p class="text-gray-400 mb-8">Добавьте товары, чтобы оформить заказ</p>
      <RouterLink to="/shop" class="btn-primary">Перейти в каталог</RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items -->
      <div class="lg:col-span-2">
        <div class="card p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-900">
              Товары ({{ cartStore.itemCount }})
            </h2>
            <button
              class="text-sm text-red-500 hover:text-red-700"
              @click="cartStore.clearCart()"
            >
              Очистить корзину
            </button>
          </div>
          <CartItem
            v-for="item in cartStore.items"
            :key="item.productId"
            :item="item"
          />
        </div>
      </div>

      <!-- Summary -->
      <div>
        <div class="card p-6 sticky top-20">
          <h2 class="font-semibold text-gray-900 mb-4">Итого</h2>
          <div class="space-y-3 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Товары</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Доставка</span>
              <span class="text-green-600">Бесплатно</span>
            </div>
            <div class="border-t border-gray-100 pt-3 flex justify-between font-semibold text-base">
              <span>Итого</span>
              <span>{{ formatPrice(total) }}</span>
            </div>
          </div>

          <RouterLink
            v-if="authStore.isAuthenticated"
            to="/checkout"
            class="btn-primary w-full text-center block"
          >
            Оформить заказ
          </RouterLink>
          <div v-else>
            <RouterLink to="/auth/login" class="btn-primary w-full text-center block mb-2">
              Войти для оформления
            </RouterLink>
            <p class="text-xs text-center text-gray-400">или</p>
            <RouterLink to="/auth/register" class="btn-secondary w-full text-center block mt-2 text-sm">
              Зарегистрироваться
            </RouterLink>
          </div>

          <RouterLink to="/shop" class="block text-center text-sm text-primary-600 hover:underline mt-4">
            ← Продолжить покупки
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>