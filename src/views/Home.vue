<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import ProductCard from '@/components/products/ProductCard.vue';
import SkeletonCard from '@/components/common/SkeletonCard.vue';

const productStore = useProductStore();
const authStore = useAuthStore();

onMounted(async () => {
  await Promise.all([
    productStore.fetchFeatured(),
    productStore.fetchCategories(),
  ]);
});

const heroSlides = [
  {
    title: 'Смартфоны нового поколения',
    subtitle: 'Флагманские модели по лучшим ценам',
    color: 'from-primary-700 to-primary-900',
    emoji: '📱',
    link: '/shop?category=smartphones',
  },
  {
    title: 'Ноутбуки для работы и учёбы',
    subtitle: 'Производительность без компромиссов',
    color: 'from-purple-700 to-purple-900',
    emoji: '💻',
    link: '/shop?category=laptops',
  },
];
</script>

<template>
  <div>
    <!-- Hero banner -->
    <section class="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col sm:flex-row items-center gap-8">
        <div class="flex-1">
          <span class="text-primary-200 text-sm font-medium uppercase tracking-wider">Лучшие цены в Казахстане</span>
          <h1 class="text-3xl sm:text-5xl font-bold mt-2 leading-tight">
            Электроника<br />и техника<br />
            <span class="text-yellow-300">для вашего дома</span>
          </h1>
          <p class="mt-4 text-primary-100 text-lg max-w-md">
            Тысячи товаров с быстрой доставкой и удобной оплатой через внутренний кошелёк
          </p>
          <div class="mt-8 flex gap-3">
            <RouterLink to="/shop" class="bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Перейти в каталог
            </RouterLink>
            <RouterLink v-if="!authStore.isAuthenticated" to="/auth/register" class="border border-white/50 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Зарегистрироваться
            </RouterLink>
          </div>
        </div>
        <div class="text-9xl hidden sm:block select-none">🖥️</div>
      </div>
    </section>

    <!-- Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="section-title mb-6">Категории товаров</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <RouterLink
          v-for="cat in [
            { icon: '📱', name: 'Смартфоны', slug: 'smartphones' },
            { icon: '💻', name: 'Ноутбуки', slug: 'laptops' },
            { icon: '📺', name: 'Телевизоры', slug: 'tvs' },
            { icon: '🏠', name: 'Техника', slug: 'appliances' },
            { icon: '🎧', name: 'Аксессуары', slug: 'accessories' },
          ]"
          :key="cat.slug"
          :to="`/shop?category=${cat.slug}`"
          class="card p-4 text-center hover:shadow-md hover:border-primary-200 border border-transparent transition-all group"
        >
          <div class="text-4xl mb-2 group-hover:scale-110 transition-transform">{{ cat.icon }}</div>
          <p class="text-sm font-medium text-gray-700">{{ cat.name }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- Featured products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title">Популярные товары</h2>
        <RouterLink to="/shop" class="text-sm text-primary-600 hover:underline font-medium">
          Все товары →
        </RouterLink>
      </div>

      <!-- Skeletons -->
      <div v-if="productStore.loading && productStore.featuredProducts.length === 0"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <SkeletonCard v-for="i in 8" :key="i" />
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in productStore.featuredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>

    <!-- Wallet CTA -->
    <section class="bg-gradient-to-r from-green-600 to-green-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center gap-6">
        <div class="text-6xl">💳</div>
        <div class="flex-1 text-center sm:text-left">
          <h2 class="text-2xl font-bold">Пополните кошелёк и покупайте проще</h2>
          <p class="text-green-100 mt-2">
            Внутренний кошелёк ТехноМаркет — пополняйте баланс и оплачивайте заказы мгновенно без карт и комиссий
          </p>
        </div>
        <RouterLink
          to="/profile?tab=wallet"
          class="shrink-0 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
        >
          Пополнить кошелёк
        </RouterLink>
      </div>
    </section>
  </div>
</template>
