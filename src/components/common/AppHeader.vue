<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import { logout } from '@/services/authService';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'vue3-toastify';
import { formatPrice } from '@/utils';
import { onClickOutside } from '@vueuse/core';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const productStore = useProductStore();
const userStore = useUserStore();

const searchQuery = ref('');
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

onClickOutside(userMenuRef, () => {
  userMenuOpen.value = false;
});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const user = computed(() => authStore.currentUser);
const cartCount = computed(() => cartStore.itemCount);
const balance = computed(() => user.value?.balance ?? 0);

const handleSearch = (): void => {
  if (!searchQuery.value.trim()) return;
  productStore.setFilters({ search: searchQuery.value.trim() });
  router.push({ name: 'shop', query: { search: searchQuery.value } });
  searchQuery.value = '';
};

const handleLogout = async (): Promise<void> => {
  await logout();
  userStore.$reset();
  authStore.setUser(null);
  toast.info('Вы вышли из аккаунта');
  userMenuOpen.value = false;
  router.push('/');
};

const navLinks = [
  { name: 'Каталог', to: '/shop' },
  { name: 'Смартфоны', to: '/shop?category=smartphones' },
  { name: 'Ноутбуки', to: '/shop?category=laptops' },
  { name: 'Бытовая техника', to: '/shop?category=appliances' },
];
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <!-- Top bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 shrink-0">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">ТМ</span>
          </div>
          <span class="font-bold text-lg text-gray-900 hidden sm:block">ТехноМаркет</span>
        </RouterLink>

        <!-- Search -->
        <form class="flex-1 max-w-xl" @submit.prevent="handleSearch">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Поиск товаров..."
              class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <!-- Right actions -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Balance (авторизованные) -->
          <RouterLink
            v-if="isAuthenticated"
            to="/profile?tab=wallet"
            class="hidden sm:flex items-center gap-1 text-sm font-medium text-green-700
                   bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {{ formatPrice(balance) }}
          </RouterLink>

          <!-- Cart -->
          <RouterLink
            to="/cart"
            class="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5
                     rounded-full flex items-center justify-center font-medium"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </RouterLink>

          <!-- User menu -->
          <div v-if="isAuthenticated" class="relative" ref="userMenuRef">
            <button
              class="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              @click="userMenuOpen = !userMenuOpen"
            >
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                <img v-if="user?.avatar" :src="user.avatar" alt="avatar" class="w-full h-full object-cover" />
                <span v-else class="text-primary-700 font-semibold text-sm">
                  {{ user?.firstName?.charAt(0) ?? 'U' }}
                </span>
              </div>
            </button>

            <!-- Dropdown -->
            <Transition name="fade">
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border
                       border-gray-100 py-1 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                </div>
                <RouterLink to="/profile" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="userMenuOpen = false">
                  Профиль
                </RouterLink>
                <RouterLink to="/orders" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="userMenuOpen = false">
                  Мои заказы
                </RouterLink>
                <RouterLink v-if="isAdmin" to="/admin" class="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"
                  @click="userMenuOpen = false">
                  Панель администратора
                </RouterLink>
                <button
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  @click="handleLogout"
                >
                  Выйти
                </button>
              </div>
            </Transition>
          </div>

          <div v-else class="flex items-center gap-2">
            <RouterLink to="/auth/login" class="btn-secondary text-sm py-1.5 px-3">
              Войти
            </RouterLink>
            <RouterLink to="/auth/register" class="btn-primary text-sm py-1.5 px-3 hidden sm:block">
              Регистрация
            </RouterLink>
          </div>

          <!-- Mobile menu btn -->
          <button
            class="sm:hidden p-2 text-gray-600"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation bar -->
    <nav class="border-t border-gray-100 hidden sm:block">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul class="flex items-center gap-6 h-10 text-sm">
          <li v-for="link in navLinks" :key="link.to">
            <RouterLink
              :to="link.to"
              class="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              active-class="text-primary-600"
            >
              {{ link.name }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div v-if="mobileMenuOpen" class="sm:hidden border-t border-gray-100 bg-white">
        <ul class="px-4 py-2 space-y-1">
          <li v-for="link in navLinks" :key="link.to">
            <RouterLink
              :to="link.to"
              class="block py-2 text-gray-700 hover:text-primary-600"
              @click="mobileMenuOpen = false"
            >
              {{ link.name }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
