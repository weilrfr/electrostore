<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { registerWithEmail, getAuthErrorMessage, getUserProfile } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ firstName: '', lastName: '', phone: '', email: '', password: '', confirm: '' });
const loading = ref(false);
const showPass = ref(false);
const error = ref('');

const handleRegister = async (): Promise<void> => {
  if (form.value.password !== form.value.confirm) {
    error.value = 'Пароли не совпадают'; return;
  }
  if (form.value.password.length < 6) {
    error.value = 'Минимум 6 символов'; return;
  }
  loading.value = true; error.value = '';
  try {
    const user = await registerWithEmail({
      email: form.value.email,
      password: form.value.password,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phone: form.value.phone,
    });
    const profile = await getUserProfile(user.uid);
    authStore.setUser(profile);
    toast.success('Аккаунт создан! Добро пожаловать!');
    router.push('/');
  } catch (e: unknown) {
    const code = (e as { code?: string }).code ?? '';
    error.value = getAuthErrorMessage(code);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-xl">ТМ</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Создать аккаунт</h1>
        <p class="text-gray-500 text-sm mt-1">Присоединяйтесь к ТехноМаркет</p>
      </div>

      <div class="card p-8">
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ error }}
        </div>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input v-model="form.firstName" class="input-field" placeholder="Иван" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
              <input v-model="form.lastName" class="input-field" placeholder="Иванов" required />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input v-model="form.phone" type="tel" class="input-field" placeholder="+7 (777) 123-45-67" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="your@email.com" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="input-field pr-10"
                placeholder="Минимум 6 символов"
                required
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" @click="showPass = !showPass">
                {{ showPass ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
            <input v-model="form.confirm" :type="showPass ? 'text' : 'password'" class="input-field" placeholder="Повторите пароль" required />
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? 'Создание...' : 'Создать аккаунт' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Уже есть аккаунт?
          <RouterLink to="/auth/login" class="text-primary-600 font-medium hover:underline">Войти</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
