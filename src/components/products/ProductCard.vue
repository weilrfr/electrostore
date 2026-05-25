<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import type { Product } from '@/types';
import { formatPrice } from '@/utils';

interface Props {
  product: Product;
}

const props = defineProps<Props>();
const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const displayPrice = computed(() => props.product.discountPrice ?? props.product.price);
const hasDiscount = computed(() => !!props.product.discountPrice);
const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0;
  return Math.round((1 - props.product.discountPrice! / props.product.price) * 100);
});

const handleAddToCart = (): void => {
  if (props.product.stock === 0) return;

  if (!authStore.isAuthenticated) {
    toast.info('Войдите в аккаунт, чтобы добавить товар в корзину');
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  cartStore.addItem(props.product, 1);
  toast.success(`${props.product.name} добавлен в корзину`);
};

const renderStars = (rating: number): boolean[] => {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
};
</script>

<template>
  <div class="card flex flex-col group hover:shadow-md transition-shadow">
    <!-- Image -->
    <RouterLink :to="`/product/${product.id}`" class="block relative overflow-hidden rounded-t-xl">
      <img
        :src="product.images[0] || '/placeholder.jpg'"
        :alt="product.name"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <!-- Badges -->
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="hasDiscount" class="badge bg-red-500 text-white">
          -{{ discountPercent }}%
        </span>
        <span v-if="product.featured" class="badge bg-primary-600 text-white">
          Топ продаж
        </span>
      </div>
      <!-- Out of stock -->
      <div
        v-if="product.stock === 0"
        class="absolute inset-0 bg-black/40 flex items-center justify-center"
      >
        <span class="text-white font-semibold text-sm">Нет в наличии</span>
      </div>
    </RouterLink>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1">
      <!-- Name -->
      <RouterLink :to="`/product/${product.id}`">
        <h3 class="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors mb-2">
          {{ product.name }}
        </h3>
      </RouterLink>

      <!-- Rating -->
      <div class="flex items-center gap-1 mb-3">
        <div class="flex">
          <svg
            v-for="(filled, i) in renderStars(product.rating)"
            :key="i"
            class="w-3.5 h-3.5"
            :class="filled ? 'text-yellow-400' : 'text-gray-200'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <span class="text-xs text-gray-500">({{ product.reviews }})</span>
      </div>

      <!-- Price -->
      <div class="mt-auto">
        <div class="flex items-end gap-2 mb-3">
          <span class="text-lg font-bold text-gray-900">{{ formatPrice(displayPrice) }}</span>
          <span v-if="hasDiscount" class="text-sm text-gray-400 line-through">
            {{ formatPrice(product.price) }}
          </span>
        </div>

        <!-- Add to cart -->
        <button
          class="btn-primary w-full text-sm"
          :disabled="product.stock === 0"
          @click="handleAddToCart"
        >
          <span v-if="product.stock === 0">Нет в наличии</span>
          <span v-else-if="!authStore.isAuthenticated">Войти для покупки</span>
          <span v-else>В корзину</span>
        </button>
      </div>
    </div>
  </div>
</template>