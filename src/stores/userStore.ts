import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Order, WalletTransaction } from '@/types';
import { getUserOrders } from '@/services/orderService';
import { getWalletTransactions } from '@/services/userService';

export const useUserStore = defineStore('user', () => {
  const orders = ref<Order[]>([]);
  const transactions = ref<WalletTransaction[]>([]);
  const ordersLoading = ref(false);
  const transactionsLoading = ref(false);

  const fetchUserOrders = async (userId: string): Promise<void> => {
    ordersLoading.value = true;
    try {
      orders.value = await getUserOrders(userId);
    } finally {
      ordersLoading.value = false;
    }
  };

  const fetchTransactions = async (userId: string): Promise<void> => {
    transactionsLoading.value = true;
    try {
      transactions.value = await getWalletTransactions(userId);
    } finally {
      transactionsLoading.value = false;
    }
  };

  const $reset = (): void => {
    orders.value = [];
    transactions.value = [];
  };

  return {
    orders,
    transactions,
    ordersLoading,
    transactionsLoading,
    fetchUserOrders,
    fetchTransactions,
    $reset,
  };
});
