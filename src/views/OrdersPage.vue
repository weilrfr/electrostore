<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import OrderStatusBadge from '@/components/common/OrderStatusBadge.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { formatPrice, formatDate } from '@/utils';

const authStore = useAuthStore();
const userStore = useUserStore();

onMounted(async () => {
  if (authStore.currentUser) {
    await userStore.fetchUserOrders(authStore.currentUser.uid);
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="page-title mb-8">Мои заказы</h1>

    <LoadingSpinner v-if="userStore.ordersLoading" text="Загрузка заказов..." />

    <div
      v-else-if="userStore.orders.length === 0"
      class="text-center py-20"
    >
      <div class="text-7xl mb-4 text-gray-300">
        <i class="fa-solid fa-clipboard-list"></i>
      </div>
      <p class="text-xl font-medium text-gray-700 mb-2">Заказов пока нет</p>
      <p class="text-gray-400 mb-8">Перейдите в каталог, чтобы сделать первый заказ</p>
      <RouterLink to="/shop" class="btn-primary">В каталог</RouterLink>
    </div>

    <div v-else class="space-y-4">
      <RouterLink
        v-for="order in userStore.orders"
        :key="order.id"
        :to="`/orders/${order.id}`"
        class="card p-5 block hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="font-semibold text-gray-900">{{ order.orderNumber }}</p>
            <p class="text-sm text-gray-500 mt-0.5">от {{ formatDate(order.createdAt) }}</p>
          </div>
          <OrderStatusBadge :status="order.status" />
        </div>

        <!-- Предпросмотр товаров -->
        <div class="flex items-center gap-2 mt-3">
          <img
            v-for="item in order.items.slice(0, 3)"
            :key="item.productId"
            :src="item.image"
            :alt="item.name"
            class="w-12 h-12 object-cover rounded-lg border border-gray-100"
          />
          <span v-if="order.items.length > 3" class="text-sm text-gray-400">
            +{{ order.items.length - 3 }} ещё
          </span>
        </div>

        <div class="flex items-center justify-between mt-3">
          <p class="text-sm text-gray-500">{{ order.items.length }} товар(ов)</p>
          <p class="font-bold text-gray-900">{{ formatPrice(order.total) }}</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
