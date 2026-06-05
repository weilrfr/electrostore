import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderStatus, CartItem, Address } from '@/types';

const ordersRef = collection(db, 'orders');

// Генерация номера заказа

const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `ORD-${year}-${random}`;
};

// Создание заказа (списание с кошелька)

export interface CreateOrderData {
  userId: string;
  items: CartItem[];
  shippingAddress: Address;
  subtotal: number;
  shipping: number;
  total: number;
}

export const createOrder = async (data: CreateOrderData): Promise<string> => {
  const userRef = doc(db, 'users', data.userId);

  // Транзакция: проверяем баланс и создаём заказ атомарно
  const orderId = await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error('Пользователь не найден');

    const currentBalance: number = userSnap.data().balance ?? 0;
    if (currentBalance < data.total) {
      throw new Error('Недостаточно средств на балансе');
    }

    const orderItems = data.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.discountPrice ?? item.price,
      image: item.image,
    }));

    const orderRef = doc(collection(db, 'orders'));
    transaction.set(orderRef, {
      orderNumber: generateOrderNumber(),
      userId: data.userId,
      status: 'pending',
      items: orderItems,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      shippingAddress: data.shippingAddress,
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Списываем с баланса
    transaction.update(userRef, { balance: currentBalance - data.total });

    // Записываем транзакцию кошелька
    const txRef = doc(collection(db, 'walletTransactions'));
    transaction.set(txRef, {
      userId: data.userId,
      type: 'purchase',
      amount: -data.total,
      description: `Оплата заказа`,
      orderId: orderRef.id,
      createdAt: serverTimestamp(),
    });

    return orderRef.id;
  });

  return orderId;
};

// Получение заказа по ID

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
};

// Заказы пользователя

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
};

// Все заказы (для администратора)

export const getAllOrders = async (): Promise<Order[]> => {
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
};

// Обновление статуса заказа (для администратора)

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<void> => {
  const updates: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (trackingNumber) updates.trackingNumber = trackingNumber;
  await updateDoc(doc(db, 'orders', orderId), updates);
};

// Отмена заказа и возврат средств

export const cancelOrder = async (orderId: string, userId: string): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef);
    const userSnap = await transaction.get(userRef);
    if (!orderSnap.exists() || !userSnap.exists()) throw new Error('Документ не найден');

    const order = orderSnap.data() as Order;
    if (!['pending', 'processing'].includes(order.status)) {
      throw new Error('Заказ нельзя отменить на этом этапе');
    }

    const currentBalance: number = userSnap.data().balance ?? 0;
    transaction.update(orderRef, { status: 'cancelled', updatedAt: serverTimestamp() });
    transaction.update(userRef, { balance: currentBalance + order.total });

    // Транзакция возврата
    const txRef = doc(collection(db, 'walletTransactions'));
    transaction.set(txRef, {
      userId,
      type: 'refund',
      amount: order.total,
      description: `Возврат по заказу ${order.orderNumber}`,
      orderId,
      createdAt: serverTimestamp(),
    });
  });
};
