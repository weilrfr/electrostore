import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import {
  loginWithEmail,
  registerWithEmail,
  logout as firebaseLogout,
  resetPassword,
  getUserProfile,
  onAuthChange,
  getAuthErrorMessage,
  type RegisterData,
} from '@/services/authService';

/**
 * Composable для работы с аутентификацией.
 * Обеспечивает авто-восстановление сессии и типизированные методы.
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const userStore = useUserStore();
  const router = useRouter();

  let unsubscribe: (() => void) | null = null;

  // ─── Инициализация слушателя авторизации ──────────────────────────────────

  const initAuth = (): void => {
    authStore.setLoading(true);
    unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        authStore.setUser(profile);
      } else {
        authStore.setUser(null);
        userStore.$reset();
      }
      authStore.setLoading(false);
    });
  };

  const stopAuth = (): void => {
    unsubscribe?.();
  };

  onMounted(initAuth);
  onUnmounted(stopAuth);

  // ─── Вход ─────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await loginWithEmail(email, password);
      toast.success('Добро пожаловать!');
      await router.push('/');
    } catch (error: unknown) {
      const code = (error as { code?: string }).code ?? '';
      toast.error(getAuthErrorMessage(code));
      throw error;
    }
  };

  // ─── Регистрация ──────────────────────────────────────────────────────────

  const register = async (data: RegisterData): Promise<void> => {
    try {
      await registerWithEmail(data);
      toast.success('Аккаунт создан! Добро пожаловать!');
      await router.push('/');
    } catch (error: unknown) {
      const code = (error as { code?: string }).code ?? '';
      toast.error(getAuthErrorMessage(code));
      throw error;
    }
  };

  // ─── Выход ────────────────────────────────────────────────────────────────

  const logout = async (): Promise<void> => {
    await firebaseLogout();
    cartStore.clearCart();
    userStore.$reset();
    toast.info('Вы вышли из аккаунта');
    await router.push('/');
  };

  // ─── Сброс пароля ─────────────────────────────────────────────────────────

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await resetPassword(email);
      toast.success('Письмо для сброса пароля отправлено');
    } catch {
      toast.error('Не удалось отправить письмо');
    }
  };

  return {
    currentUser: authStore.currentUser,
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    isLoading: authStore.isLoading,
    login,
    register,
    logout,
    sendPasswordReset,
    initAuth,
    stopAuth,
  };
};
