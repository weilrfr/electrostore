<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import { loginWithEmail, getAuthErrorMessage } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { getUserProfile } from '@/services/authService';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const error = ref('');

const handleLogin = async (): Promise<void> => {
  if (!email.value || !password.value) return;
  loading.value = true;
  error.value = '';
  try {
    const user = await loginWithEmail(email.value, password.value);
    const profile = await getUserProfile(user.uid);
    authStore.setUser(profile);
    toast.success('Добро пожаловать!');
    const redirect = route.query.redirect as string || '/';
    router.push(redirect);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code ?? '';
    error.value = getAuthErrorMessage(code);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-xl">ТМ</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Вход в аккаунт</h1>
        <p class="text-gray-500 text-sm mt-1">Добро пожаловать в ТехноМаркет</p>
      </div>

      <div class="card p-8">
        <!-- Error -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ error }}
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              class="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="input-field pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="text-right">
            <RouterLink to="/auth/forgot" class="text-sm text-primary-600 hover:underline">
              Забыли пароль?
            </RouterLink>
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading || !email || !password"
          >
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Нет аккаунта?
          <RouterLink to="/auth/register" class="text-primary-600 font-medium hover:underline">
            Зарегистрируйтесь
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
