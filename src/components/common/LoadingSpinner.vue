<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
});

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-8">
    <div
      :class="['animate-spin rounded-full border-4 border-primary-100 border-t-primary-600', sizeClasses[props.size]]"
    />
    <p v-if="text" class="text-sm text-gray-500">{{ text }}</p>
  </div>
</template>
