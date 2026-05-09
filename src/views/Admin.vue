<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { toast } from 'vue3-toastify';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';
import { getAllTopupRequests, approveTopupRequest, rejectTopupRequest, getAllUsers } from '@/services/userService';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/productService';
import type { Order, TopupRequest, Product, OrderStatus } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, TOPUP_STATUS_LABELS, TOPUP_STATUS_COLORS } from '@/utils';
import OrderStatusBadge from '@/components/common/OrderStatusBadge.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const activeTab = ref('dashboard');

// ─── State ────────────────────────────────────────────────────────────────────
const orders = ref<Order[]>([]);
const topupRequests = ref<TopupRequest[]>([]);
const products = ref<Product[]>([]);
const usersCount = ref(0);
const loading = ref(true);

// Product form
const showProductForm = ref(false);
const editingProduct = ref<Product | null>(null);
const productForm = ref({
  name: '', description: '', category: 'smartphones', subcategory: '',
  price: 0, discountPrice: undefined as number | undefined,
  stock: 0, sku: '', tags: '', featured: false,
  images: [''], specifications: {} as Record<string, string>,
});
const specKey = ref('');
const specVal = ref('');

onMounted(async () => {
  await loadAll();
});

const loadAll = async (): Promise<void> => {
  loading.value = true;
  try {
    const [ords, reqs, prods, users] = await Promise.all([
      getAllOrders(),
      getAllTopupRequests(),
      getProducts({}, 50).then((r) => r.products),
      getAllUsers(),
    ]);
    orders.value = ords;
    topupRequests.value = reqs;
    products.value = prods;
    usersCount.value = users.length;
  } finally {
    loading.value = false;
  }
};

// ─── Dashboard stats ──────────────────────────────────────────────────────────
const totalRevenue = computed(() =>
  orders.value.filter((o) => o.paymentStatus === 'completed').reduce((s, o) => s + o.total, 0),
);
const pendingOrders = computed(() => orders.value.filter((o) => o.status === 'pending').length);
const pendingTopups = computed(() => topupRequests.value.filter((r) => r.status === 'pending').length);

// ─── Orders ───────────────────────────────────────────────────────────────────
const orderFilter = ref<string>('all');
const filteredOrders = computed(() =>
  orderFilter.value === 'all' ? orders.value : orders.value.filter((o) => o.status === orderFilter.value),
);
const trackingNumber = ref('');

const changeStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  await updateOrderStatus(orderId, status, trackingNumber.value || undefined);
  const o = orders.value.find((x) => x.id === orderId);
  if (o) { o.status = status; if (trackingNumber.value) o.trackingNumber = trackingNumber.value; }
  toast.success('Статус обновлён');
  trackingNumber.value = '';
};

// ─── Wallet requests ──────────────────────────────────────────────────────────
const handleApprove = async (req: TopupRequest): Promise<void> => {
  await approveTopupRequest(req.id, req.userId, req.amount);
  req.status = 'approved';
  toast.success(`Баланс пользователя пополнен на ${formatPrice(req.amount)}`);
};

const handleReject = async (req: TopupRequest): Promise<void> => {
  await rejectTopupRequest(req.id);
  req.status = 'rejected';
  toast.info('Заявка отклонена');
};

// ─── Products ─────────────────────────────────────────────────────────────────
const startEditProduct = (p: Product): void => {
  editingProduct.value = p;
  productForm.value = {
    name: p.name, description: p.description, category: p.category,
    subcategory: p.subcategory ?? '', price: p.price,
    discountPrice: p.discountPrice, stock: p.stock, sku: p.sku,
    tags: p.tags.join(', '), featured: p.featured,
    images: [...p.images], specifications: { ...p.specifications },
  };
  showProductForm.value = true;
};

const resetProductForm = (): void => {
  editingProduct.value = null;
  showProductForm.value = false;
  productForm.value = {
    name: '', description: '', category: 'smartphones', subcategory: '',
    price: 0, discountPrice: undefined, stock: 0, sku: '', tags: '',
    featured: false, images: [''], specifications: {},
  };
};

const addSpec = (): void => {
  if (specKey.value && specVal.value) {
    productForm.value.specifications[specKey.value] = specVal.value;
    specKey.value = ''; specVal.value = '';
  }
};

const saveProduct = async (): Promise<void> => {
  // Валидация
  if (!productForm.value.name.trim()) {
    toast.error('Укажите название товара');
    return;
  }
  if (productForm.value.price <= 0) {
    toast.error('Цена должна быть больше 0');
    return;
  }
  if (!productForm.value.images[0]?.trim()) {
    toast.error('Укажите URL изображения');
    return;
  }

  // Строим объект данных, исключая undefined значения
  const data: Record<string, any> = {
    name: productForm.value.name.trim(),
    description: productForm.value.description.trim(),
    category: productForm.value.category,
    price: productForm.value.price,
    stock: Math.max(0, productForm.value.stock),
    sku: productForm.value.sku.trim(),
    tags: productForm.value.tags.split(',').map((t) => t.trim()).filter(Boolean),
    featured: productForm.value.featured,
    images: productForm.value.images.filter(Boolean),
    specifications: productForm.value.specifications,
    rating: editingProduct.value?.rating ?? 0,
    reviews: editingProduct.value?.reviews ?? 0,
  };

  // Добавляем опциональные поля только если они имеют значение
  if (productForm.value.subcategory?.trim()) {
    data.subcategory = productForm.value.subcategory.trim();
  }
  if (productForm.value.discountPrice && productForm.value.discountPrice > 0) {
    data.discountPrice = productForm.value.discountPrice;
  }

  try {
    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, data);
      toast.success('✅ Товар обновлён');
    } else {
      await createProduct(data);
      toast.success('✅ Товар добавлен');
    }
    resetProductForm();
    products.value = (await getProducts({}, 50)).products;
  } catch (error: unknown) {
    console.error('Product save error:', error);
    const message = (error as { message?: string }).message ?? 'Неизвестная ошибка';
    
    if (message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
      toast.error('❌ Нет прав доступа. Проверьте что вы администратор.');
    } else if (message.includes('invalid-argument') || message.includes('invalid data')) {
      toast.error('❌ Некорректные данные. Проверьте форму.');
    } else {
      toast.error(`❌ Ошибка: ${message}`);
    }
  }
};

const removeProduct = async (id: string): Promise<void> => {
  if (!confirm('Удалить товар?')) return;
  await deleteProduct(id);
  products.value = products.value.filter((p) => p.id !== id);
  toast.success('Товар удалён');
};

const tabs = [
  { id: 'dashboard', label: '📊 Дашборд' },
  { id: 'orders', label: `📦 Заказы${pendingOrders.value ? ` (${pendingOrders.value})` : ''}` },
  { id: 'products', label: '🛍️ Товары' },
  { id: 'wallet', label: `💳 Пополнения${pendingTopups.value ? ` (${pendingTopups.value})` : ''}` },
];
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="page-title mb-6">Панель администратора</h1>

    <!-- Tabs -->
    <div class="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
          activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else>

      <!-- Dashboard -->
      <div v-if="activeTab === 'dashboard'" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-5">
          <p class="text-sm text-gray-500">Всего заказов</p>
          <p class="text-3xl font-bold text-gray-900 mt-1">{{ orders.length }}</p>
        </div>
        <div class="card p-5">
          <p class="text-sm text-gray-500">Выручка</p>
          <p class="text-3xl font-bold text-green-600 mt-1">{{ formatPrice(totalRevenue) }}</p>
        </div>
        <div class="card p-5">
          <p class="text-sm text-gray-500">Пользователей</p>
          <p class="text-3xl font-bold text-gray-900 mt-1">{{ usersCount }}</p>
        </div>
        <div class="card p-5">
          <p class="text-sm text-gray-500">Заявок на пополнение</p>
          <p class="text-3xl font-bold text-yellow-600 mt-1">{{ pendingTopups }}</p>
        </div>

        <!-- Recent orders -->
        <div class="card p-5 col-span-2 lg:col-span-4">
          <h2 class="font-semibold text-gray-900 mb-4">Последние заказы</h2>
          <div class="space-y-3">
            <div v-for="order in orders.slice(0, 5)" :key="order.id"
              class="flex items-center justify-between text-sm py-2 border-b last:border-0">
              <div>
                <p class="font-medium">{{ order.orderNumber }}</p>
                <p class="text-gray-400 text-xs">{{ formatDate(order.createdAt) }}</p>
              </div>
              <OrderStatusBadge :status="order.status" />
              <span class="font-semibold">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders -->
      <div v-else-if="activeTab === 'orders'">
        <div class="flex gap-2 flex-wrap mb-4">
          <button
            v-for="s in ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']"
            :key="s"
            :class="['px-3 py-1.5 rounded-lg text-sm border transition-colors',
              orderFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 hover:border-gray-400']"
            @click="orderFilter = s"
          >
            {{ s === 'all' ? 'Все' : ORDER_STATUS_LABELS[s] }}
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="order in filteredOrders" :key="order.id" class="card p-5">
            <div class="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <p class="font-semibold">{{ order.orderNumber }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }} · {{ formatPrice(order.total) }}</p>
                <p class="text-sm text-gray-500">{{ order.shippingAddress.city }}, {{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</p>
              </div>
              <OrderStatusBadge :status="order.status" />
            </div>
            <!-- Change status -->
            <div v-if="order.status !== 'delivered' && order.status !== 'cancelled'" class="flex gap-2 flex-wrap">
              <input v-if="order.status === 'processing'" v-model="trackingNumber" class="input-field w-48 text-sm" placeholder="Трек-номер (опционально)" />
              <select class="input-field w-auto text-sm" @change="changeStatus(order.id, ($event.target as HTMLSelectElement).value as OrderStatus)">
                <option value="">Изменить статус...</option>
                <option v-for="(label, key) in ORDER_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div v-else-if="activeTab === 'products'">
        <div class="flex justify-between mb-4">
          <p class="text-gray-500 text-sm">{{ products.length }} товаров</p>
          <button class="btn-primary text-sm" @click="showProductForm = !showProductForm; editingProduct = null">
            + Добавить товар
          </button>
        </div>

        <!-- Product form -->
        <Transition name="fade">
          <div v-if="showProductForm" class="card p-6 mb-6">
            <h3 class="font-semibold mb-4">{{ editingProduct ? 'Редактировать товар' : 'Новый товар' }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input v-model="productForm.name" class="input-field" required />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea v-model="productForm.description" rows="3" class="input-field resize-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <select v-model="productForm.category" class="input-field">
                  <option value="smartphones">Смартфоны</option>
                  <option value="laptops">Ноутбуки</option>
                  <option value="tvs">Телевизоры</option>
                  <option value="appliances">Бытовая техника</option>
                  <option value="accessories">Аксессуары</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input v-model="productForm.sku" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Цена (₸)</label>
                <input v-model.number="productForm.price" type="number" class="input-field" min="0" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Цена со скидкой (₸)</label>
                <input v-model.number="productForm.discountPrice" type="number" class="input-field" min="0" placeholder="Оставьте пустым если нет" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Остаток</label>
                <input v-model.number="productForm.stock" type="number" class="input-field" min="0" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Теги (через запятую)</label>
                <input v-model="productForm.tags" class="input-field" placeholder="акция, новинка" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">URL изображения</label>
                <input v-model="productForm.images[0]" class="input-field" placeholder="https://..." />
              </div>
              <div class="sm:col-span-2 flex items-center gap-2">
                <input v-model="productForm.featured" type="checkbox" id="featured" class="w-4 h-4" />
                <label for="featured" class="text-sm font-medium text-gray-700">Рекомендованный товар</label>
              </div>

              <!-- Specs -->
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Характеристики</label>
                <div class="flex gap-2 mb-2">
                  <input v-model="specKey" class="input-field" placeholder="Параметр" />
                  <input v-model="specVal" class="input-field" placeholder="Значение" />
                  <button type="button" class="btn-secondary shrink-0" @click="addSpec">+</button>
                </div>
                <div class="space-y-1">
                  <div v-for="(val, key) in productForm.specifications" :key="key"
                    class="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1 rounded">
                    <span class="text-gray-500">{{ key }}:</span>
                    <span class="font-medium">{{ val }}</span>
                    <button class="ml-auto text-red-400 hover:text-red-600" @click="delete productForm.specifications[key]">×</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="btn-primary" @click="saveProduct">Сохранить</button>
              <button class="btn-secondary" @click="resetProductForm">Отмена</button>
            </div>
          </div>
        </Transition>

        <!-- Products table -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-4 py-3 text-left font-medium text-gray-500">Товар</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500">Цена</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500">Остаток</th>
                  <th class="px-4 py-3 text-left font-medium text-gray-500">Рейтинг</th>
                  <th class="px-4 py-3" />
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <img :src="p.images[0]" :alt="p.name" class="w-10 h-10 object-cover rounded" />
                      <div>
                        <p class="font-medium text-gray-900 line-clamp-1">{{ p.name }}</p>
                        <p class="text-xs text-gray-400">{{ p.sku }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="font-medium">{{ formatPrice(p.discountPrice ?? p.price) }}</span>
                    <span v-if="p.discountPrice" class="text-gray-400 line-through ml-1 text-xs">{{ formatPrice(p.price) }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="p.stock > 0 ? 'text-green-600' : 'text-red-500'">{{ p.stock }}</span>
                  </td>
                  <td class="px-4 py-3">★ {{ p.rating.toFixed(1) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2 justify-end">
                      <button class="text-primary-600 hover:underline text-xs" @click="startEditProduct(p)">Изменить</button>
                      <button class="text-red-500 hover:underline text-xs" @click="removeProduct(p.id)">Удалить</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Wallet requests -->
      <div v-else-if="activeTab === 'wallet'">
        <h2 class="section-title mb-4">Заявки на пополнение баланса</h2>
        <div v-if="topupRequests.length === 0" class="text-center py-10 text-gray-400">
          Заявок нет
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="req in topupRequests"
            :key="req.id"
            class="card p-5 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <p class="font-medium text-gray-900">{{ req.userName }}</p>
              <p class="text-sm text-gray-500">{{ req.userEmail }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatDate(req.createdAt) }}</p>
            </div>
            <p class="text-xl font-bold text-gray-900">{{ formatPrice(req.amount) }}</p>
            <span :class="['badge', TOPUP_STATUS_COLORS[req.status]]">{{ TOPUP_STATUS_LABELS[req.status] }}</span>
            <div v-if="req.status === 'pending'" class="flex gap-2">
              <button class="btn-primary text-sm py-1.5 px-3" @click="handleApprove(req)">
                ✓ Одобрить
              </button>
              <button class="btn-danger text-sm py-1.5 px-3" @click="handleReject(req)">
                ✗ Отклонить
              </button>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
