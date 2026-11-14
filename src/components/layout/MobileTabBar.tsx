import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export function MobileTabBar() {
  const { pathname } = useLocation();
  const bagCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const tabs = [
    { to: '/', label: 'Home', icon: Home, match: pathname === '/' },
    {
      to: '/women/all',
      label: 'Shop',
      icon: Grid,
      match:
        pathname.startsWith('/women') ||
        pathname.startsWith('/men') ||
        pathname.startsWith('/kids') ||
        pathname.startsWith('/footwear') ||
        pathname.startsWith('/accessories') ||
        pathname.startsWith('/beauty'),
    },
    { to: '/search', label: 'Search', icon: Search, match: pathname.startsWith('/search') },
    {
      to: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistCount,
      match: pathname.startsWith('/wishlist'),
    },
    {
      to: '/bag',
      label: 'Bag',
      icon: ShoppingBag,
      badge: bagCount,
      match: pathname.startsWith('/bag'),
    },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white border-t border-[#EAEAEC] shadow-[0_-4px_16px_rgba(40,44,63,0.08)] flex items-center justify-around px-1 no-print"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`relative flex flex-col items-center justify-center flex-1 h-full text-[10px] font-semibold transition-colors ${
              tab.match ? 'text-[#FF3F6C]' : 'text-[#535766]'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" aria-hidden="true" />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#FF3F6C] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
