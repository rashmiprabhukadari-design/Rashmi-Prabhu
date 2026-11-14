import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address, UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  addresses: Address[];
  recentSearches: string[];
  recentlyViewedIds: string[];
  savedPincode: string;
  loginWithOtp: (phone: string, role?: 'customer' | 'admin') => void;
  loginWithGoogle: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<UserProfile, 'name' | 'email' | 'phone'>>) => void;
  addLoyaltyPoints: (points: number) => void;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  addRecentlyViewed: (productId: string) => void;
  setSavedPincode: (pincode: string) => void;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
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
  {
    id: 'addr-2',
    fullName: 'Aarav Sharma',
    phone: '9876543210',
    pincode: '400001',
    houseLine: '14th Floor, Trade Tower B, Nariman Point',
    locality: 'Fort',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Work',
    isDefault: false,
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      addresses: DEFAULT_ADDRESSES,
      recentSearches: ['Linen Shirt', 'Midi Dress', 'Court Sneakers'],
      recentlyViewedIds: [],
      savedPincode: '560001',

      loginWithOtp: (phone, role = 'customer') =>
        set({
          isAuthenticated: true,
          user: {
            id: role === 'admin' ? 'usr-admin' : 'usr-demo',
            name: role === 'admin' ? 'StyleKart Admin' : 'Aarav Sharma',
            phone,
            email:
              role === 'admin'
                ? 'admin@stylekart.in'
                : 'aarav.sharma@example.in',
            role,
            loyaltyPoints: 1240,
            joinedAt: '2025-06-14T09:00:00Z',
          },
        }),

      loginWithGoogle: () =>
        set({
          isAuthenticated: true,
          user: {
            id: 'usr-google',
            name: 'Ananya Rao',
            phone: '9845012345',
            email: 'ananya.rao@gmail.com',
            role: 'customer',
            loyaltyPoints: 860,
            joinedAt: '2026-01-12T10:30:00Z',
          },
        }),

      logout: () => set({ isAuthenticated: false, user: null }),

      updateProfile: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),

      addLoyaltyPoints: (points) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, loyaltyPoints: state.user.loyaltyPoints + points }
            : null,
        })),

      addAddress: (addr) => {
        const created: Address = { ...addr, id: `addr-${Date.now()}` };
        set((state) => {
          const base = created.isDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false }))
            : state.addresses;
          return { addresses: [created, ...base] };
        });
        return created;
      },

      updateAddress: (address) =>
        set((state) => ({
          addresses: state.addresses.map((a) => {
            if (a.id === address.id) return address;
            return address.isDefault ? { ...a, isDefault: false } : a;
          }),
        })),

      deleteAddress: (id) =>
        set((state) => {
          const remaining = state.addresses.filter((a) => a.id !== id);
          if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return { addresses: remaining };
        }),

      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),

      addRecentSearch: (term) =>
        set((state) => {
          const clean = term.trim();
          if (!clean) return state;
          const next = [
            clean,
            ...state.recentSearches.filter(
              (t) => t.toLowerCase() !== clean.toLowerCase()
            ),
          ].slice(0, 6);
          return { recentSearches: next };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      addRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewedIds: [
            productId,
            ...state.recentlyViewedIds.filter((id) => id !== productId),
          ].slice(0, 10),
        })),

      setSavedPincode: (pincode) => set({ savedPincode: pincode }),
    }),
    {
      name: 'stylekart-auth-v1',
    }
  )
);
