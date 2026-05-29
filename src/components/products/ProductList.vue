<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import ProductCard from './ProductCard.vue';
import SkeletonCard from '@/components/common/SkeletonCard.vue';
import type { ProductFilter } from '@/types';
import { SORT_OPTIONS } from '@/utils';

interface Props {
  initialCategory?: string;
}

const props = defineProps<Props>();
const productStore = useProductStore();

const minPrice = ref('');
const maxPrice = ref('');
const selectedRating = ref(0);
const selectedSort = ref<ProductFilter['sortBy']>('newest');
const showFilters = ref(false);

const applyFilters = (): void => {
  productStore.setFilters({
    category: props.initialCategory,
    minPrice: minPrice.value ? Number(minPrice.value) : undefined,
    maxPrice: maxPrice.value ? Number(maxPrice.value) : undefined,
    minRating: selectedRating.value || undefined,
    sortBy: selectedSort.value,
  });
};

const resetFilters = (): void => {
  minPrice.value = '';
  maxPrice.value = '';
  selectedRating.value = 0;
  selectedSort.value = 'newest';
  productStore.setFilters({ category: props.initialCategory });
};

onMounted(() => {
  applyFilters();
});

watch(() => props.initialCategory, () => {
  applyFilters();
});

const loadMore = (): void => {
  productStore.fetchMore();
};
</script>

<template>
  <div>
    <!-- Filter bar -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <button
          class="btn-secondary text-sm flex items-center gap-2"
          @click="showFilters = !showFilters"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Фильтры
        </button>
        <span class="text-sm text-gray-500">
          {{ productStore.products.length }} товаров
        </span>
      </div>

      <!-- Sort -->
      <select
        v-model="selectedSort"
        class="input-field w-auto text-sm"
        @change="applyFilters"
      >
        <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Filter panel -->
    <Transition name="fade">
      <div v-if="showFilters" class="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Price range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Цена (₸)</label>
          <div class="flex items-center gap-2">
            <input
              v-model="minPrice"
              type="number"
              placeholder="От"
              class="input-field"
              min="0"
            />
            <span class="text-gray-400">—</span>
            <input
              v-model="maxPrice"
              type="number"
              placeholder="До"
              class="input-field"
              min="0"
            />
          </div>
        </div>

        <!-- Rating -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Рейтинг от</label>
          <div class="flex items-center gap-2">
            <button
              v-for="r in [1, 2, 3, 4, 5]"
              :key="r"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                selectedRating === r
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400',
              ]"
              @click="selectedRating = selectedRating === r ? 0 : r"
            >
              {{ r }} <i class="fa-solid fa-star text-yellow-400 text-xs ml-0.5"></i>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-end gap-2">
          <button class="btn-primary text-sm flex-1" @click="applyFilters">
            Применить
          </button>
          <button class="btn-secondary text-sm" @click="resetFilters">
            Сбросить
          </button>
        </div>
      </div>
    </Transition>

    <!-- Skeletons -->
    <div v-if="productStore.loading && productStore.products.length === 0"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <SkeletonCard v-for="i in 8" :key="i" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!productStore.loading && productStore.products.length === 0"
      class="text-center py-16"
    >
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-500 text-lg font-medium">Товары не найдены</p>
      <p class="text-gray-400 text-sm mt-1">Попробуйте изменить фильтры</p>
      <button class="btn-primary mt-4 text-sm" @click="resetFilters">Сбросить фильтры</button>
    </div>

    <!-- Products grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <ProductCard
        v-for="product in productStore.products"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Load more -->
    <div v-if="productStore.hasMore && productStore.products.length > 0" class="mt-8 text-center">
      <button
        class="btn-secondary"
        :disabled="productStore.loading"
        @click="loadMore"
      >
        <span v-if="productStore.loading">Загрузка...</span>
        <span v-else>Загрузить ещё</span>
      </button>
    </div>
  </div>
</template>