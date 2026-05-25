<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { getUserProfile, onAuthChange } from '@/services/authService';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  authStore.setLoading(true);

  unsubscribe = onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      authStore.setUser(profile);
      await cartStore.initCart(firebaseUser.uid);
    } else {
      authStore.setUser(null);
      await cartStore.initCart(null);
    }
    authStore.setLoading(false);
  });
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <!-- Ждём инициализации корзины перед рендером страниц -->
      <RouterView v-if="cartStore.isInitialized" v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
      <!-- Спиннер пока Firebase не вернул состояние авторизации и корзину -->
      <div v-else class="flex items-center justify-center min-h-[60vh]">
        <div class="animate-spin rounded-full border-4 border-primary-100 border-t-primary-600 w-10 h-10" />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>