<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getUserProfile, onAuthChange } from '@/services/authService';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';

const authStore = useAuthStore();
let unsubscribe: (() => void) | null = null;

// Инициализируем слушатель авторизации на уровне приложения
onMounted(() => {
  authStore.setLoading(true);
  unsubscribe = onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      authStore.setUser(profile);
    } else {
      authStore.setUser(null);
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
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
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
