import { useAuthStore } from '../store/useAuthStore';
import { useCatalogStore } from '../store/useCatalogStore';
import type {
  Address,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
} from '../types';
import {
  calculatePointsForOrder,
  calculatePriceBreakup,
} from '../utils/commerce';

export const orderService = {
  getOrdersForUser(userId?: string): Order[] {
    const orders = useCatalogStore.getState().orders;
    if (!userId) return orders;
    return orders.filter((o) => o.userId === userId || o.userId === 'usr-demo');
  },

  getOrderById(id: string): Order | undefined {
    return useCatalogStore.getState().orders.find((o) => o.id === id);
  },

  placeOrder(params: {
    cartItems: CartItem[];
    address: Address;
    paymentMethod: PaymentMethod;
    paymentLast4?: string;
    couponCode: string | null;
  }): Order {
    const { products, coupons, orders, addOrder } = useCatalogStore.getState();
    const { user, addLoyaltyPoints } = useAuthStore.getState();
    const isFirstOrder = orders.length === 0;
    const appliedCoupon = params.couponCode
      ? coupons.find((c) => c.code === params.couponCode) ?? null
      : null;

    const priceBreakup = calculatePriceBreakup(
      params.cartItems,
      products,
      appliedCoupon,
      isFirstOrder
    );

    const productMap = new Map(products.map((p) => [p.id, p]));
    const items = params.cartItems
      .map((item) => {
        const p = productMap.get(item.productId);
        if (!p) return null;
        return {
          productId: p.id,
          title: p.title,
          brand: p.brand,
          image: p.images[0],
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          unitPrice: p.price,
          unitMrp: p.mrp,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    const pointsEarned = calculatePointsForOrder(priceBreakup.totalPayable);
    const order: Order = {
      id: `SK-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.id ?? 'usr-guest',
      createdAt: new Date().toISOString(),
      estimatedDelivery,
      status: 'Placed',
      paymentMethod: params.paymentMethod,
      paymentLast4: params.paymentLast4,
      address: params.address,
      items,
      priceBreakup,
      pointsEarned,
    };

    addOrder(order);
    if (user) {
      addLoyaltyPoints(pointsEarned);
    }
    return order;
  },

  updateStatus(
    orderId: string,
    status: OrderStatus,
    meta?: {
      cancellationReason?: string;
      returnReason?: string;
      returnType?: 'Return' | 'Exchange';
    }
  ) {
    useCatalogStore.getState().updateOrderStatus(orderId, status, meta);
  },
};
