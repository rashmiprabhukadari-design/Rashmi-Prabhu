import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Banner, Coupon, Order, OrderStatus, Product } from '../types';
import { INITIAL_BRANDS } from '../data/brands';
import { INITIAL_BANNERS, INITIAL_COUPONS } from '../data/coupons';
import { INITIAL_PRODUCTS } from '../data/products';

interface CatalogState {
  products: Product[];
  brands: typeof INITIAL_BRANDS;
  coupons: Coupon[];
  banners: Banner[];
  orders: Order[];
  // Admin & Order mutations
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, meta?: { cancellationReason?: string; returnReason?: string; returnType?: 'Return' | 'Exchange' }) => void;
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;
  addBanner: (banner: Banner) => void;
  updateBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
}

const DEMO_ORDERS: Order[] = [
  {
    id: 'SK-ORD-849201',
    userId: 'usr-demo',
    createdAt: '2026-11-08T11:24:00Z',
    estimatedDelivery: 'Thu, 19 Nov',
    status: 'Out for delivery',
    paymentMethod: 'UPI',
    address: {
      id: 'addr-1',
      fullName: 'Aarav Sharma',
      phone: '9876543210',
      pincode: '560001',
      houseLine: '402, Rosewood Residences, Lavelle Road',
      locality: 'Ashok Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      type: 'Home',
      isDefault: true,
    },
    items: [
      {
        productId: INITIAL_PRODUCTS[0].id,
        title: INITIAL_PRODUCTS[0].title,
        brand: INITIAL_PRODUCTS[0].brand,
        image: INITIAL_PRODUCTS[0].images[0],
        size: 'M',
        color: INITIAL_PRODUCTS[0].colors[0].name,
        quantity: 1,
        unitPrice: INITIAL_PRODUCTS[0].price,
        unitMrp: INITIAL_PRODUCTS[0].mrp,
      },
      {
        productId: INITIAL_PRODUCTS[38].id,
        title: INITIAL_PRODUCTS[38].title,
        brand: INITIAL_PRODUCTS[38].brand,
        image: INITIAL_PRODUCTS[38].images[0],
        size: 'UK 8',
        color: INITIAL_PRODUCTS[38].colors[0].name,
        quantity: 1,
        unitPrice: INITIAL_PRODUCTS[38].price,
        unitMrp: INITIAL_PRODUCTS[38].mrp,
      },
    ],
    priceBreakup: {
      totalMrp: INITIAL_PRODUCTS[0].mrp + INITIAL_PRODUCTS[38].mrp,
      productDiscount:
        INITIAL_PRODUCTS[0].mrp -
        INITIAL_PRODUCTS[0].price +
        (INITIAL_PRODUCTS[38].mrp - INITIAL_PRODUCTS[38].price),
      subtotal: INITIAL_PRODUCTS[0].price + INITIAL_PRODUCTS[38].price,
      couponCode: 'STYLE200',
      couponDiscount: 200,
      shippingFee: 0,
      totalPayable: INITIAL_PRODUCTS[0].price + INITIAL_PRODUCTS[38].price - 200,
      totalSavings:
        INITIAL_PRODUCTS[0].mrp -
        INITIAL_PRODUCTS[0].price +
        (INITIAL_PRODUCTS[38].mrp - INITIAL_PRODUCTS[38].price) +
        200,
      freeShippingThreshold: 999,
      amountToFreeShipping: 0,
    },
    pointsEarned: 194,
  },
  {
    id: 'SK-ORD-773190',
    userId: 'usr-demo',
    createdAt: '2026-10-22T15:10:00Z',
    estimatedDelivery: 'Mon, 26 Oct',
    status: 'Delivered',
    paymentMethod: 'CARD',
    paymentLast4: '1111',
    address: {
      id: 'addr-1',
      fullName: 'Aarav Sharma',
      phone: '9876543210',
      pincode: '560001',
      houseLine: '402, Rosewood Residences, Lavelle Road',
      locality: 'Ashok Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      type: 'Home',
      isDefault: true,
    },
    items: [
      {
        productId: INITIAL_PRODUCTS[14].id,
        title: INITIAL_PRODUCTS[14].title,
        brand: INITIAL_PRODUCTS[14].brand,
        image: INITIAL_PRODUCTS[14].images[0],
        size: 'M',
        color: INITIAL_PRODUCTS[14].colors[0].name,
        quantity: 1,
        unitPrice: INITIAL_PRODUCTS[14].price,
        unitMrp: INITIAL_PRODUCTS[14].mrp,
      },
    ],
    priceBreakup: {
      totalMrp: INITIAL_PRODUCTS[14].mrp,
      productDiscount: INITIAL_PRODUCTS[14].mrp - INITIAL_PRODUCTS[14].price,
      subtotal: INITIAL_PRODUCTS[14].price,
      couponCode: null,
      couponDiscount: 0,
      shippingFee: 0,
      totalPayable: INITIAL_PRODUCTS[14].price,
      totalSavings: INITIAL_PRODUCTS[14].mrp - INITIAL_PRODUCTS[14].price,
      freeShippingThreshold: 999,
      amountToFreeShipping: 0,
    },
    pointsEarned: 109,
  },
];

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      brands: INITIAL_BRANDS,
      coupons: INITIAL_COUPONS,
      banners: INITIAL_BANNERS,
      orders: DEMO_ORDERS,

      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),

      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),

      updateOrderStatus: (orderId, status, meta) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status, ...(meta || {}) } : o
          ),
        })),

      addCoupon: (coupon) =>
        set((state) => ({
          coupons: [
            coupon,
            ...state.coupons.filter((c) => c.code !== coupon.code),
          ],
        })),

      toggleCoupon: (code) =>
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.code === code ? { ...c, active: !c.active } : c
          ),
        })),

      deleteCoupon: (code) =>
        set((state) => ({
          coupons: state.coupons.filter((c) => c.code !== code),
        })),

      addBanner: (banner) =>
        set((state) => ({ banners: [banner, ...state.banners] })),

      updateBanner: (banner) =>
        set((state) => ({
          banners: state.banners.map((b) => (b.id === banner.id ? banner : b)),
        })),

      deleteBanner: (id) =>
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== id),
        })),
    }),
    {
      name: 'stylekart-catalog-v1',
      partialize: (state) => ({
        products: state.products,
        coupons: state.coupons,
        banners: state.banners,
        orders: state.orders,
      }),
    }
  )
);
