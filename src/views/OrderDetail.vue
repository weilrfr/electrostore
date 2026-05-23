<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { getOrderById, cancelOrder } from '@/services/orderService';
import { useAuthStore } from '@/stores/authStore';
import type { Order } from '@/types';
import { formatPrice, formatDateTime, ORDER_STATUS_LABELS } from '@/utils';
import OrderStatusBadge from '@/components/common/OrderStatusBadge.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const order = ref<Order | null>(null);
const loading = ref(true);
const cancelling = ref(false);

onMounted(async () => {
  try {
    order.value = await getOrderById(route.params.id as string);
    if (!order.value) router.push('/orders');
  } finally {
    loading.value = false;
  }
});

const handleCancel = async (): Promise<void> => {
  if (!order.value || !authStore.currentUser) return;
  cancelling.value = true;
  try {
    await cancelOrder(order.value.id, authStore.currentUser.uid);
    authStore.updateBalance((authStore.currentUser.balance ?? 0) + order.value.total);
    order.value.status = 'cancelled';
    toast.success('Заказ отменён. Средства возвращены на баланс.');
  } catch (e: unknown) {
    toast.error((e as Error).message);
  } finally {
    cancelling.value = false;
  }
};

const steps = ['pending', 'processing', 'shipped', 'delivered'];
const stepIndex = (status: string): number => steps.indexOf(status);
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink to="/orders" class="text-gray-400 hover:text-gray-600">
        ← Мои заказы
      </RouterLink>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="order">
      <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 class="page-title">{{ order.orderNumber }}</h1>
          <p class="text-gray-500 text-sm mt-1">{{ formatDateTime(order.createdAt) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <OrderStatusBadge :status="order.status" />
          <button
            v-if="['pending', 'processing'].includes(order.status)"
            class="btn-danger text-sm"
            :disabled="cancelling"
            @click="handleCancel"
          >
            {{ cancelling ? 'Отмена...' : 'Отменить заказ' }}
          </button>
        </div>
      </div>

      <!-- Progress tracker -->
      <div v-if="order.status !== 'cancelled'" class="card p-6 mb-6">
        <div class="flex items-center">
          <template v-for="(step, i) in steps" :key="step">
            <div class="flex flex-col items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2',
                stepIndex(order.status) >= i
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-200 text-gray-400',
              ]">
                {{ i + 1 }}
              </div>
              <p class="text-xs mt-1 text-center" :class="stepIndex(order.status) >= i ? 'text-primary-600 font-medium' : 'text-gray-400'">
                {{ ORDER_STATUS_LABELS[step] }}
              </p>
            </div>
            <div
              v-if="i < steps.length - 1"
              :class="['flex-1 h-0.5 mx-2', stepIndex(order.status) > i ? 'bg-primary-600' : 'bg-gray-200']"
            />
          </template>
        </div>
        <p v-if="order.trackingNumber" class="text-sm text-gray-500 mt-4 text-center">
          Трек-номер: <span class="font-medium text-gray-900">{{ order.trackingNumber }}</span>
        </p>
      </div>

      <!-- Items -->
      <div class="card p-6 mb-6">
        <h2 class="font-semibold text-gray-900 mb-4">Товары</h2>
        <div class="space-y-4">
          <div v-for="item in order.items" :key="item.productId" class="flex gap-4">
            <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded-lg shrink-0" />
            <div class="flex-1">
              <RouterLink :to="`/product/${item.productId}`" class="text-sm font-medium text-gray-900 hover:text-primary-600">
                {{ item.name }}
              </RouterLink>
              <p class="text-sm text-gray-500">{{ item.quantity }} шт × {{ formatPrice(item.price) }}</p>
            </div>
            <p class="font-semibold text-sm shrink-0">{{ formatPrice(item.price * item.quantity) }}</p>
          </div>
        </div>
      </div>

      <!-- Summary + Address -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-3">Итого</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Товары</span>
              <span>{{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Доставка</span>
              <span class="text-green-600">Бесплатно</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-bold">
              <span>Итого</span>
              <span>{{ formatPrice(order.total) }}</span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t">
            <p class="text-xs text-gray-500">Способ оплаты: Кошелёк ТехноМаркет</p>
            <p class="text-xs mt-1" :class="order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'">
              {{ order.paymentStatus === 'completed' ? '✓ Оплачено' : 'Ожидает оплаты' }}
            </p>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-3">Адрес доставки</h2>
          <div class="text-sm text-gray-600 space-y-1">
            <p class="font-medium text-gray-900">{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</p>
            <p>{{ order.shippingAddress.address }}</p>
            <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}</p>
            <p>{{ order.shippingAddress.country }}</p>
            <p>{{ order.shippingAddress.phone }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>