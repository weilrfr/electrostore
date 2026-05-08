<script setup lang="ts">
import type { OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils';

interface Props {
  status: OrderStatus | string;
}
defineProps<Props>();
</script>

<template>
  <span :class="['badge', ORDER_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700']">
    {{ ORDER_STATUS_LABELS[status] ?? status }}
  </span>
</template>
