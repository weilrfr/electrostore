<script setup lang="ts">
interface Props {
  rating: number;   // 0–5
  count?: number;
  size?: 'sm' | 'md';
  interactive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  interactive: false,
});

const emit = defineEmits<{ select: [value: number] }>();

const stars = [1, 2, 3, 4, 5];

const starClass = (i: number): string => {
  const filled = i <= Math.round(props.rating);
  return filled ? 'text-yellow-400' : 'text-gray-200';
};

const sizeClass = props.size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="i in stars"
      :key="i"
      :class="['transition-colors', sizeClass, starClass(i), interactive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default']"
      :disabled="!interactive"
      @click="interactive && emit('select', i)"
    >
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
    <span v-if="count !== undefined" class="text-xs text-gray-500 ml-1">({{ count }})</span>
  </div>
</template>
