import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  appliedCouponCode: string | null;
  addItem: (
    productId: string,
    selectedSize: string,
    selectedColor: string,
    quantity?: number
  ) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSize: (itemId: string, newSize: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      appliedCouponCode: null,

      addItem: (productId, selectedSize, selectedColor, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === productId &&
              i.selectedSize === selectedSize &&
              i.selectedColor === selectedColor
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: Math.min(10, i.quantity + quantity) }
                  : i
              ),
            };
          }
          const newItem: CartItem = {
            id: `${productId}-${selectedSize}-${selectedColor}-${Date.now()}`,
            productId,
            selectedSize,
            selectedColor,
            quantity,
          };
          return { items: [...state.items, newItem] };
        }),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== itemId)
              : state.items.map((i) =>
                  i.id === itemId
                    ? { ...i, quantity: Math.min(10, quantity) }
                    : i
                ),
        })),

      updateSize: (itemId, newSize) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, selectedSize: newSize } : i
          ),
        })),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      clearCart: () => set({ items: [], appliedCouponCode: null }),

      applyCoupon: (code) =>
        set({ appliedCouponCode: code ? code.trim().toUpperCase() : null }),
    }),
    {
      name: 'stylekart-bag-v1',
    }
  )
);
