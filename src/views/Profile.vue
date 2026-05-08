<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { updateUserProfile, uploadAvatar, addAddress, deleteAddress, createTopupRequest, getWalletTransactions } from '@/services/userService';
import type { Address, WalletTransaction } from '@/types';
import { formatPrice, formatDateTime, TOPUP_STATUS_LABELS, TOPUP_STATUS_COLORS } from '@/utils';
import { v4 as uuidv4 } from 'uuid';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const user = computed(() => authStore.currentUser);
const activeTab = ref((route.query.tab as string) || 'profile');

// Profile form
const profileForm = ref({
  firstName: user.value?.firstName ?? '',
  lastName: user.value?.lastName ?? '',
  phone: user.value?.phone ?? '',
});
const savingProfile = ref(false);

// Wallet
const transactions = ref<WalletTransaction[]>([]);
const topupAmount = ref<number>(5000);
const requestingTopup = ref(false);

// Address form
const showAddressForm = ref(false);
const newAddr = ref<Omit<Address, 'id' | 'isDefault'>>({
  firstName: '', lastName: '', address: '', city: '',
  postalCode: '', country: 'Казахстан', phone: '',
});

onMounted(async () => {
  if (user.value) {
    transactions.value = await getWalletTransactions(user.value.uid);
  }
});

const setTab = (tab: string): void => {
  activeTab.value = tab;
  router.replace({ query: { tab } });
};

const saveProfile = async (): Promise<void> => {
  if (!user.value) return;
  savingProfile.value = true;
  try {
    await updateUserProfile(user.value.uid, profileForm.value);
    authStore.setUser({ ...user.value, ...profileForm.value });
    toast.success('Профиль сохранён');
  } catch { toast.error('Ошибка сохранения'); }
  finally { savingProfile.value = false; }
};

const handleAvatarChange = async (e: Event): Promise<void> => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !user.value) return;
  try {
    const url = await uploadAvatar(user.value.uid, file);
    authStore.setUser({ ...user.value, avatar: url });
    toast.success('Аватар обновлён');
  } catch { toast.error('Ошибка загрузки аватара'); }
};

const addNewAddress = async (): Promise<void> => {
  if (!user.value) return;
  const address: Address = { id: uuidv4(), isDefault: false, ...newAddr.value };
  try {
    await addAddress(user.value.uid, address);
    authStore.setUser({ ...user.value, addresses: [...user.value.addresses, address] });
    showAddressForm.value = false;
    newAddr.value = { firstName: '', lastName: '', address: '', city: '', postalCode: '', country: 'Казахстан', phone: '' };
    toast.success('Адрес добавлен');
  } catch { toast.error('Ошибка добавления адреса'); }
};

const removeAddress = async (address: Address): Promise<void> => {
  if (!user.value) return;
  try {
    await deleteAddress(user.value.uid, address);
    authStore.setUser({ ...user.value, addresses: user.value.addresses.filter((a) => a.id !== address.id) });
    toast.success('Адрес удалён');
  } catch { toast.error('Ошибка удаления'); }
};

const requestTopup = async (): Promise<void> => {
  if (!user.value || topupAmount.value < 100) return;
  requestingTopup.value = true;
  try {
    await createTopupRequest(
      user.value.uid,
      user.value.email,
      `${user.value.firstName} ${user.value.lastName}`,
      topupAmount.value,
    );
    toast.success('Заявка на пополнение отправлена администратору');
    topupAmount.value = 5000;
  } catch { toast.error('Ошибка отправки заявки'); }
  finally { requestingTopup.value = false; }
};

const txTypeIcon = (type: string): string => {
  const icons: Record<string, string> = { topup: '📥', purchase: '🛒', refund: '↩️' };
  return icons[type] ?? '💰';
};

const tabs = [
  { id: 'profile', label: 'Профиль' },
  { id: 'addresses', label: 'Адреса' },
  { id: 'wallet', label: 'Кошелёк' },
];
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="page-title mb-8">Личный кабинет</h1>

    <!-- Tabs -->
    <div class="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="setTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Profile tab -->
    <div v-if="activeTab === 'profile'" class="card p-6">
      <h2 class="section-title mb-6">Личные данные</h2>

      <!-- Avatar -->
      <div class="flex items-center gap-4 mb-6">
        <div class="relative">
          <div class="w-20 h-20 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
            <img v-if="user?.avatar" :src="user.avatar" alt="avatar" class="w-full h-full object-cover" />
            <span v-else class="text-3xl font-bold text-primary-600">{{ user?.firstName?.charAt(0) }}</span>
          </div>
          <label class="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700">
            <span class="text-white text-xs">✎</span>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </label>
        </div>
        <div>
          <p class="font-semibold text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
          <p class="text-sm text-gray-500">{{ user?.email }}</p>
          <span v-if="user?.role === 'admin'" class="badge bg-purple-100 text-purple-700 text-xs mt-1">Администратор</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
          <input v-model="profileForm.firstName" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
          <input v-model="profileForm.lastName" class="input-field" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
          <input v-model="profileForm.phone" class="input-field" placeholder="+7 (777) 123-45-67" />
        </div>
      </div>

      <button
        class="btn-primary mt-6"
        :disabled="savingProfile"
        @click="saveProfile"
      >
        {{ savingProfile ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </div>

    <!-- Addresses tab -->
    <div v-else-if="activeTab === 'addresses'" class="space-y-4">
      <div
        v-for="addr in user?.addresses"
        :key="addr.id"
        class="card p-5 flex items-start justify-between gap-4"
      >
        <div class="text-sm">
          <div class="flex items-center gap-2 mb-1">
            <p class="font-medium text-gray-900">{{ addr.firstName }} {{ addr.lastName }}</p>
            <span v-if="addr.isDefault" class="badge bg-primary-100 text-primary-700 text-xs">По умолчанию</span>
          </div>
          <p class="text-gray-500">{{ addr.address }}</p>
          <p class="text-gray-500">{{ addr.city }}, {{ addr.postalCode }}</p>
          <p class="text-gray-500">{{ addr.phone }}</p>
        </div>
        <button class="text-red-400 hover:text-red-600 text-sm shrink-0" @click="removeAddress(addr)">
          Удалить
        </button>
      </div>

      <div v-if="!user?.addresses.length" class="text-center py-10 text-gray-400">
        <p class="text-5xl mb-3">📍</p>
        <p>Нет сохранённых адресов</p>
      </div>

      <button class="btn-secondary w-full" @click="showAddressForm = !showAddressForm">
        {{ showAddressForm ? 'Отмена' : '+ Добавить адрес' }}
      </button>

      <Transition name="fade">
        <div v-if="showAddressForm" class="card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input v-model="newAddr.firstName" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
            <input v-model="newAddr.lastName" class="input-field" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input v-model="newAddr.address" class="input-field" placeholder="ул. Абая, д. 1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Город</label>
            <input v-model="newAddr.city" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Индекс</label>
            <input v-model="newAddr.postalCode" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input v-model="newAddr.phone" class="input-field" />
          </div>
          <div class="sm:col-span-2">
            <button class="btn-primary" @click="addNewAddress">Сохранить адрес</button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Wallet tab -->
    <div v-else-if="activeTab === 'wallet'" class="space-y-6">
      <!-- Balance card -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <p class="text-green-100 text-sm font-medium">Баланс кошелька</p>
        <p class="text-4xl font-bold mt-1">{{ formatPrice(user?.balance ?? 0) }}</p>
        <p class="text-green-100 text-sm mt-2">ТехноМаркет · Внутренний кошелёк</p>
      </div>

      <!-- Request topup -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Пополнить баланс</h3>
        <p class="text-sm text-gray-500 mb-4">
          Отправьте заявку администратору. После проверки средства будут зачислены на ваш счёт.
        </p>
        <div class="flex gap-3 flex-wrap mb-3">
          <button
            v-for="preset in [1000, 5000, 10000, 20000]"
            :key="preset"
            :class="[
              'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
              topupAmount === preset
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 hover:border-gray-400',
            ]"
            @click="topupAmount = preset"
          >
            {{ formatPrice(preset) }}
          </button>
        </div>
        <div class="flex gap-3">
          <input
            v-model.number="topupAmount"
            type="number"
            min="100"
            class="input-field flex-1"
            placeholder="Сумма (₸)"
          />
          <button
            class="btn-primary shrink-0"
            :disabled="topupAmount < 100 || requestingTopup"
            @click="requestTopup"
          >
            {{ requestingTopup ? 'Отправка...' : 'Запросить' }}
          </button>
        </div>
      </div>

      <!-- Transactions -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 mb-4">История операций</h3>
        <div v-if="transactions.length === 0" class="text-center py-8 text-gray-400">
          Операций пока нет
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
          >
            <span class="text-2xl">{{ txTypeIcon(tx.type) }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ tx.description }}</p>
              <p class="text-xs text-gray-400">{{ formatDateTime(tx.createdAt) }}</p>
            </div>
            <span :class="['font-semibold text-sm', tx.amount >= 0 ? 'text-green-600' : 'text-red-600']">
              {{ tx.amount >= 0 ? '+' : '' }}{{ formatPrice(tx.amount) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
