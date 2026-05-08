<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { createOrder } from '@/services/orderService';
import type { Address } from '@/types';
import { formatPrice, TAX_RATE } from '@/utils';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const user = computed(() => authStore.currentUser);
const subtotal = computed(() => cartStore.subtotal);
const tax = computed(() => Math.round(subtotal.value * TAX_RATE));
const total = computed(() => subtotal.value + tax.value);

const loading = ref(false);
const selectedAddressId = ref<string>('');
const useNewAddress = ref(false);

// Форма нового адреса
const newAddress = ref<Omit<Address, 'id' | 'isDefault'>>({
  firstName: user.value?.firstName ?? '',
  lastName: user.value?.lastName ?? '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Казахстан',
  phone: user.value?.phone ?? '',
});

onMounted(() => {
  const defaultAddr = user.value?.addresses.find((a) => a.isDefault);
  if (defaultAddr) selectedAddressId.value = defaultAddr.id;
  else if (user.value?.addresses.length === 0) useNewAddress.value = true;
});

const shippingAddress = computed((): Address | null => {
  if (useNewAddress.value) {
    return { id: uuidv4(), isDefault: false, ...newAddress.value };
  }
  return user.value?.addresses.find((a) => a.id === selectedAddressId.value) ?? null;
});

const canCheckout = computed(() => {
  if (!shippingAddress.value) return false;
  const a = shippingAddress.value;
  return !!(a.address && a.city && a.postalCode && a.phone);
});

const hasEnoughBalance = computed(() =>
  (user.value?.balance ?? 0) >= total.value,
);

const placeOrder = async (): Promise<void> => {
  if (!user.value || !shippingAddress.value || cartStore.items.length === 0) return;
  if (!hasEnoughBalance.value) {
    toast.error('Недостаточно средств на балансе. Пополните кошелёк.');
    return;
  }

  loading.value = true;
  try {
    const orderId = await createOrder({
      userId: user.value.uid,
      items: cartStore.items,
      shippingAddress: shippingAddress.value,
      subtotal: subtotal.value,
      shipping: 0,
      tax: tax.value,
      total: total.value,
    });

    // Обновляем баланс в store
    authStore.updateBalance((user.value.balance ?? 0) - total.value);
    cartStore.clearCart();
    toast.success('Заказ успешно оформлен!');
    router.push(`/orders/${orderId}`);
  } catch (error: unknown) {
    toast.error((error as Error).message ?? 'Ошибка при оформлении заказа');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="page-title mb-8">Оформление заказа</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Delivery + Payment -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Delivery address -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-4">📦 Адрес доставки</h2>

          <!-- Saved addresses -->
          <div v-if="user?.addresses.length" class="space-y-3 mb-4">
            <label
              v-for="addr in user.addresses"
              :key="addr.id"
              class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors"
              :class="selectedAddressId === addr.id && !useNewAddress ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input
                v-model="selectedAddressId"
                type="radio"
                :value="addr.id"
                class="mt-0.5"
                @change="useNewAddress = false"
              />
              <div class="text-sm">
                <p class="font-medium text-gray-900">{{ addr.firstName }} {{ addr.lastName }}</p>
                <p class="text-gray-500">{{ addr.address }}, {{ addr.city }}, {{ addr.postalCode }}</p>
                <p class="text-gray-500">{{ addr.phone }}</p>
              </div>
            </label>
          </div>

          <!-- New address toggle -->
          <button
            class="text-sm text-primary-600 hover:underline font-medium"
            @click="useNewAddress = !useNewAddress; selectedAddressId = ''"
          >
            {{ useNewAddress ? '← К сохранённым адресам' : '+ Новый адрес' }}
          </button>

          <Transition name="fade">
            <div v-if="useNewAddress" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input v-model="newAddress.firstName" class="input-field" placeholder="Иван" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                <input v-model="newAddress.lastName" class="input-field" placeholder="Иванов" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <input v-model="newAddress.address" class="input-field" placeholder="ул. Абая, д. 1, кв. 10" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Город</label>
                <input v-model="newAddress.city" class="input-field" placeholder="Алматы" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Почтовый индекс</label>
                <input v-model="newAddress.postalCode" class="input-field" placeholder="050000" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Страна</label>
                <input v-model="newAddress.country" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input v-model="newAddress.phone" class="input-field" placeholder="+7 (777) 123-45-67" />
              </div>
            </div>
          </Transition>
        </div>

        <!-- Payment method -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-4">💳 Способ оплаты</h2>
          <div class="flex items-center gap-3 p-4 border-2 border-primary-500 bg-primary-50 rounded-xl">
            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white text-xl">
              💰
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">Кошелёк ТехноМаркет</p>
              <p class="text-sm text-gray-500">
                Баланс: <span :class="hasEnoughBalance ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ formatPrice(user?.balance ?? 0) }}
                </span>
              </p>
            </div>
          </div>
          <div v-if="!hasEnoughBalance" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ Недостаточно средств. 
            <RouterLink to="/profile?tab=wallet" class="underline font-medium">Пополнить кошелёк</RouterLink>
          </div>
        </div>
      </div>

      <!-- Right: Order summary -->
      <div>
        <div class="card p-6 sticky top-20">
          <h2 class="font-semibold text-gray-900 mb-4">Ваш заказ</h2>

          <!-- Items list -->
          <div class="space-y-3 mb-4">
            <div
              v-for="item in cartStore.items"
              :key="item.productId"
              class="flex items-center gap-3"
            >
              <img :src="item.image" :alt="item.name" class="w-10 h-10 object-cover rounded" />
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-700 line-clamp-1">{{ item.name }}</p>
                <p class="text-xs text-gray-400">{{ item.quantity }} шт</p>
              </div>
              <span class="text-sm font-medium shrink-0">
                {{ formatPrice((item.discountPrice ?? item.price) * item.quantity) }}
              </span>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4 space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Товары</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Доставка</span>
              <span class="text-green-600">Бесплатно</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">НДС (12%)</span>
              <span>{{ formatPrice(tax) }}</span>
            </div>
            <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
              <span>Итого</span>
              <span>{{ formatPrice(total) }}</span>
            </div>
          </div>

          <button
            class="btn-primary w-full"
            :disabled="!canCheckout || !hasEnoughBalance || loading"
            @click="placeOrder"
          >
            {{ loading ? 'Оформляем...' : 'Разместить заказ' }}
          </button>

          <p class="text-xs text-gray-400 text-center mt-3">
            Оплата спишется с вашего кошелька ТехноМаркет
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
