import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistItem } from '../types';

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (productId: string, currentPrice: number) => boolean;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (productId, currentPrice) => {
        const exists = get().items.some((i) => i.productId === productId);
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          }));
          return false;
        }
        set((state) => ({
          items: [
            {
              productId,
              addedAt: new Date().toISOString(),
              addedPrice: currentPrice,
            },
            ...state.items,
          ],
        }));
        return true;
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      hasItem: (productId) =>
        get().items.some((i) => i.productId === productId),
    }),
    {
      name: 'stylekart-wishlist-v1',
    }
  )
);
