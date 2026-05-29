<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { getProductById, getRelatedProducts } from '@/services/productService';
import { getProductReviews, addReview, markAsHelpful } from '@/services/reviewService';
import type { Product, Review } from '@/types';
import { formatPrice, formatDateTime } from '@/utils';
import StarRating from '@/components/common/StarRating.vue';
import ProductCard from '@/components/products/ProductCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const product = ref<Product | null>(null);
const relatedProducts = ref<Product[]>([]);
const reviews = ref<Review[]>([]);
const loading = ref(true);
const selectedImageIndex = ref(0);
const quantity = ref(1);

// Review form
const reviewForm = ref({ rating: 5, title: '', comment: '' });
const submittingReview = ref(false);
const showReviewForm = ref(false);

const displayPrice = computed(() => product.value?.discountPrice ?? product.value?.price ?? 0);
const hasDiscount = computed(() => !!product.value?.discountPrice);

onMounted(async () => {
  const id = route.params.id as string;
  if (!id) {
    router.push('/404');
    return;
  }

  try {
    const [prod, revs] = await Promise.all([
      getProductById(id),
      getProductReviews(id),
    ]);

    if (!prod) {
      console.warn(`Product not found with ID: ${id}`);
      router.push('/404');
      return;
    }

    product.value = prod;
    reviews.value = revs;

    try {
      relatedProducts.value = await getRelatedProducts(id, prod.category, 4);
    } catch (e) {
      console.warn('Could not load related products:', e);
    }
  } catch (error: unknown) {
    console.error('Product page error:', error);
    const message = (error as { message?: string }).message ?? 'Неизвестная ошибка';

    if (message.includes('permission-denied') || message.includes('PERMISSION_DENIED')) {
      toast.error('Нет доступа к товару');
    } else {
      toast.error(`Ошибка загрузки: ${message}`);
    }

    setTimeout(() => router.push('/'), 2000);
  } finally {
    loading.value = false;
  }
});

const addToCart = (): void => {
  if (!product.value) return;

  if (!authStore.isAuthenticated) {
    toast.info('Войдите в аккаунт, чтобы добавить товар в корзину');
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  cartStore.addItem(product.value, quantity.value);
  toast.success('Товар добавлен в корзину');
};

const submitReview = async (): Promise<void> => {
  if (!authStore.currentUser || !product.value) return;
  submittingReview.value = true;
  try {
    await addReview({
      productId: product.value.id,
      userId: authStore.currentUser.uid,
      userName: `${authStore.currentUser.firstName} ${authStore.currentUser.lastName}`,
      rating: reviewForm.value.rating,
      title: reviewForm.value.title,
      comment: reviewForm.value.comment,
      verified: false,
    });
    toast.success('Отзыв опубликован');
    reviewForm.value = { rating: 5, title: '', comment: '' };
    showReviewForm.value = false;
    reviews.value = await getProductReviews(product.value.id);
  } catch {
    toast.error('Не удалось добавить отзыв');
  } finally {
    submittingReview.value = false;
  }
};

const helpful = async (reviewId: string): Promise<void> => {
  await markAsHelpful(reviewId);
  const r = reviews.value.find((x) => x.id === reviewId);
  if (r) r.helpful++;
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading -->
    <LoadingSpinner v-if="loading" text="Загрузка товара..." />

    <template v-else-if="product">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <RouterLink to="/" class="hover:text-primary-600">Главная</RouterLink>
        <span>/</span>
        <RouterLink to="/shop" class="hover:text-primary-600">Каталог</RouterLink>
        <span>/</span>
        <span class="text-gray-900 truncate max-w-xs">{{ product.name }}</span>
      </nav>

      <!-- Product section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Gallery -->
        <div>
          <div class="rounded-xl overflow-hidden border border-gray-100 bg-white mb-3">
            <img
              :src="product.images[selectedImageIndex] || '/placeholder.jpg'"
              :alt="product.name"
              class="w-full h-80 sm:h-96 object-contain p-4"
            />
          </div>
          <div v-if="product.images.length > 1" class="flex gap-2 overflow-x-auto">
            <button
              v-for="(img, i) in product.images"
              :key="i"
              :class="[
                'shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden',
                selectedImageIndex === i ? 'border-primary-500' : 'border-gray-200',
              ]"
              @click="selectedImageIndex = i"
            >
              <img :src="img" :alt="`${product.name} ${i+1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div>
          <p class="text-sm text-gray-500 mb-1">Артикул: {{ product.sku }}</p>
          <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ product.name }}</h1>

          <div class="flex items-center gap-3 mb-4">
            <StarRating :rating="product.rating" :count="product.reviews" />
          </div>

          <!-- Price -->
          <div class="flex items-end gap-3 mb-6">
            <span class="text-3xl font-bold text-gray-900">{{ formatPrice(displayPrice) }}</span>
            <span v-if="hasDiscount" class="text-lg text-gray-400 line-through">
              {{ formatPrice(product.price) }}
            </span>
            <span v-if="hasDiscount" class="badge bg-red-100 text-red-700 text-sm">
              Скидка {{ Math.round((1 - product.discountPrice! / product.price) * 100) }}%
            </span>
          </div>

          <!-- Stock -->
          <div class="mb-4">
            <span v-if="product.stock > 0" class="text-sm text-green-600 font-medium flex items-center gap-1">
              <i class="fa-solid fa-circle-check"></i>
              В наличии ({{ product.stock }} шт)
            </span>
            <span v-else class="text-sm text-red-500 font-medium flex items-center gap-1">
              <i class="fa-solid fa-circle-xmark"></i>
              Нет в наличии
            </span>
          </div>

          <!-- Quantity + Add to cart -->
          <div v-if="product.stock > 0" class="flex items-center gap-3 mb-4">
            <div
              v-if="authStore.isAuthenticated"
              class="flex items-center border border-gray-300 rounded-lg overflow-hidden"
            >
              <button
                class="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-40"
                :disabled="quantity <= 1"
                @click="quantity--"
              >−</button>
              <span class="w-10 text-center text-sm font-medium">{{ quantity }}</span>
              <button
                class="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-40"
                :disabled="quantity >= product.stock"
                @click="quantity++"
              >+</button>
            </div>
            <button class="btn-primary flex-1" @click="addToCart">
              <span v-if="authStore.isAuthenticated" class="flex items-center justify-center gap-2">
                <i class="fa-solid fa-cart-shopping"></i>
                В корзину
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <i class="fa-solid fa-lock"></i>
                Войти для покупки
              </span>
            </button>
          </div>

          <!-- Auth hint for guests -->
          <p v-if="!authStore.isAuthenticated && product.stock > 0" class="text-sm text-gray-400 mb-6">
            <RouterLink
              :to="{ name: 'login', query: { redirect: $route.fullPath } }"
              class="text-primary-600 hover:underline font-medium"
            >Войдите</RouterLink>
            или
            <RouterLink to="/auth/register" class="text-primary-600 hover:underline font-medium">зарегистрируйтесь</RouterLink>,
            чтобы добавить товар в корзину
          </p>

          <!-- Description -->
          <p class="text-gray-600 text-sm leading-relaxed mb-6">{{ product.description }}</p>

          <!-- Specs -->
          <div v-if="Object.keys(product.specifications).length > 0">
            <h3 class="font-semibold text-gray-900 mb-3">Характеристики</h3>
            <div class="space-y-2">
              <div
                v-for="(val, key) in product.specifications"
                :key="key"
                class="flex text-sm"
              >
                <span class="text-gray-500 w-40 shrink-0">{{ key }}</span>
                <span class="text-gray-900 font-medium">{{ val }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="section-title">Отзывы ({{ reviews.length }})</h2>
          <button
            v-if="authStore.isAuthenticated"
            class="btn-secondary text-sm"
            @click="showReviewForm = !showReviewForm"
          >
            {{ showReviewForm ? 'Отмена' : 'Написать отзыв' }}
          </button>
          <RouterLink v-else to="/auth/login" class="text-sm text-primary-600 hover:underline">
            Войдите, чтобы оставить отзыв
          </RouterLink>
        </div>

        <!-- Review form -->
        <Transition name="fade">
          <div v-if="showReviewForm" class="card p-6 mb-6">
            <h3 class="font-medium text-gray-900 mb-4">Ваш отзыв</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
                <StarRating
                  :rating="reviewForm.rating"
                  size="md"
                  :interactive="true"
                  @select="(v) => (reviewForm.rating = v)"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                <input v-model="reviewForm.title" class="input-field" placeholder="Кратко о товаре" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                <textarea
                  v-model="reviewForm.comment"
                  rows="4"
                  class="input-field resize-none"
                  placeholder="Поделитесь впечатлениями..."
                />
              </div>
              <button
                class="btn-primary"
                :disabled="!reviewForm.title || !reviewForm.comment || submittingReview"
                @click="submitReview"
              >
                {{ submittingReview ? 'Публикация...' : 'Опубликовать' }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Reviews list -->
        <div v-if="reviews.length === 0" class="text-center py-10 text-gray-400">
          Отзывов пока нет. Будьте первым!
        </div>
        <div v-else class="space-y-4">
          <div v-for="review in reviews" :key="review.id" class="card p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900 text-sm">{{ review.userName }}</span>
                  <span v-if="review.verified" class="badge bg-green-100 text-green-700 text-xs">Покупатель</span>
                </div>
                <StarRating :rating="review.rating" />
              </div>
              <span class="text-xs text-gray-400 shrink-0">{{ formatDateTime(review.createdAt) }}</span>
            </div>
            <h4 class="font-medium text-gray-900 mt-3">{{ review.title }}</h4>
            <p class="text-sm text-gray-600 mt-1 leading-relaxed">{{ review.comment }}</p>
            <button class="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1" @click="helpful(review.id)">
              <i class="fa-solid fa-thumbs-up"></i>
              <span>Полезно ({{ review.helpful }})</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Related products -->
      <section v-if="relatedProducts.length > 0">
        <h2 class="section-title mb-6">Похожие товары</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ProductCard v-for="p in relatedProducts" :key="p.id" :product="p" />
        </div>
      </section>
    </template>
  </div>
</template>