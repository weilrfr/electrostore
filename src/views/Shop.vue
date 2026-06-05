<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ProductList from '@/components/products/ProductList.vue';

const route = useRoute();
const category = computed(() => route.query.category as string | undefined);
const search = computed(() => route.query.search as string | undefined);

const pageTitle = computed(() => {
  const cat = category.value;
  const titles: Record<string, string> = {
    smartphones: 'Смартфоны',
    laptops: 'Ноутбуки',
    tvs: 'Телевизоры',
    appliances: 'Бытовая техника',
    accessories: 'Аксессуары',
  };
  if (search.value) return `Поиск: "${search.value}"`;
  return cat ? (titles[cat] ?? 'Каталог') : 'Все товары';
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Хлебные крошки -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <RouterLink to="/" class="hover:text-primary-600">Главная</RouterLink>
      <span>/</span>
      <span class="text-gray-900 font-medium">{{ pageTitle }}</span>
    </nav>

    <h1 class="page-title mb-6">{{ pageTitle }}</h1>

    <ProductList :initial-category="category" />
  </div>
</template>
