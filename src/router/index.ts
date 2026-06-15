import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // Публичные маршруты 
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('@/views/Shop.vue'),
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('@/views/ProductPage.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartPage.vue'),
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { guestOnly: true },
    },

    //  Защищённые маршруты (требуется авторизация) 
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/views/OrderDetail.vue'),
      meta: { requiresAuth: true },
    },

    //  Только для администратора 
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // 404 
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
});

// Навигационные guards 

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Ждём завершения инициализации авторизации
  if (authStore.isLoading) {
    await new Promise<void>((resolve) => {
      const stop = setInterval(() => {
        if (!authStore.isLoading) {
          clearInterval(stop);
          resolve();
        }
      }, 50);
    });
  }

  // Гостевые маршруты (login/register) — редирект если уже авторизован
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'home' };
  }

  // Требует авторизации
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Требует прав администратора
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' };
  }
});

export default router;
