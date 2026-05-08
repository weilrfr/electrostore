import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const isLoading = ref(true);

  const isAuthenticated = computed(() => currentUser.value !== null);
  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  const setUser = (user: User | null): void => {
    currentUser.value = user;
  };

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading;
  };

  const updateBalance = (newBalance: number): void => {
    if (currentUser.value) {
      currentUser.value.balance = newBalance;
    }
  };

  const $reset = (): void => {
    currentUser.value = null;
    isLoading.value = false;
  };

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    isAdmin,
    setUser,
    setLoading,
    updateBalance,
    $reset,
  };
});
