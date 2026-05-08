<script setup lang="ts">
import { computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem } from '@/types';
import { formatPrice } from '@/utils';

interface Props {
  item: CartItem;
}

const props = defineProps<Props>();
const cartStore = useCartStore();

const displayPrice = computed(() => props.item.discountPrice ?? props.item.price);
const lineTotal = computed(() => displayPrice.value * props.item.quantity);

const decrement = (): void => {
  cartStore.updateQuantity(props.item.productId, props.item.quantity - 1);
};

const increment = (): void => {
  cartStore.updateQuantity(props.item.productId, props.item.quantity + 1);
};

const remove = (): void => {
  cartStore.removeItem(props.item.productId);
};
</script>

<template>
  <div class="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
    <!-- Image -->
    <RouterLink :to="`/product/${item.productId}`" class="shrink-0">
      <img
        :src="item.image || '/placeholder.jpg'"
        :alt="item.name"
        class="w-20 h-20 object-cover rounded-lg border border-gray-100"
      />
    </RouterLink>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <RouterLink :to="`/product/${item.productId}`">
        <h4 class="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
          {{ item.name }}
        </h4>
      </RouterLink>
      <p class="text-sm text-gray-500 mt-0.5">{{ formatPrice(displayPrice) }} / шт</p>

      <!-- Quantity control -->
      <div class="flex items-center gap-2 mt-3">
        <button
          class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center
                 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          :disabled="item.quantity <= 1"
          @click="decrement"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
          </svg>
        </button>
        <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
        <button
          class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center
                 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          :disabled="item.quantity >= item.stock"
          @click="increment"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <span class="text-xs text-gray-400 ml-1">в наличии: {{ item.stock }}</span>
      </div>
    </div>

    <!-- Price + delete -->
    <div class="flex flex-col items-end gap-2 shrink-0">
      <p class="font-semibold text-gray-900">{{ formatPrice(lineTotal) }}</p>
      <button
        class="text-red-400 hover:text-red-600 transition-colors p-1"
        title="Удалить"
        @click="remove"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>
