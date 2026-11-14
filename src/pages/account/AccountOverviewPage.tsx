import { Link } from 'react-router-dom';
import { Award, Heart, MapPin, Package, ShoppingBag, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCatalogStore } from '../../store/useCatalogStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { calculateLoyaltyTier } from '../../utils/commerce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function AccountOverviewPage() {
  useDocumentTitle('Account Overview');
  const { user, addresses } = useAuthStore();
  const orders = useCatalogStore((s) => s.orders);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const bagCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const tierInfo = calculateLoyaltyTier(user?.loyaltyPoints || 0);

  const cards = [
    {
      to: '/account/orders',
      title: 'Orders',
      desc: `${orders.length} order(s) placed & tracked`,
      icon: Package,
    },
    {
      to: '/account/rewards',
      title: `Rewards · ${tierInfo.tier}`,
      desc: `${user?.loyaltyPoints || 0} points earned`,
      icon: Award,
    },
    {
      to: '/account/addresses',
      title: 'Saved Addresses',
      desc: `${addresses.length} delivery address(es)`,
      icon: MapPin,
    },
    {
      to: '/account/profile',
      title: 'Profile Details',
      desc: user?.phone ? `+91 ${user.phone}` : 'Manage personal info',
      icon: User,
    },
    {
      to: '/wishlist',
      title: 'Wishlist',
      desc: `${wishlistCount} saved style(s)`,
      icon: Heart,
    },
    {
      to: '/bag',
      title: 'Shopping Bag',
      desc: `${bagCount} item(s) ready to checkout`,
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-lg border border-[#EAEAEC] bg-[#FAF8FF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF3F6C]">
            {tierInfo.tier} Member
          </p>
          <h2 className="text-lg font-bold text-[#282C3F] mt-0.5">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-[#535766]">
            {tierInfo.nextTier
              ? `Earn ${tierInfo.pointsToNext} more points to unlock ${tierInfo.nextTier} perks.`
              : 'You have unlocked the highest StyleKart Runway Icon tier.'}
          </p>
        </div>
        <Link
          to="/account/rewards"
          className="h-10 px-4 rounded-lg bg-[#282C3F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center shrink-0"
        >
          View Rewards
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="p-5 border border-[#EAEAEC] rounded-lg bg-white hover:border-[#282C3F] transition-colors flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-full bg-[#FFF0F4] text-[#FF3F6C] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#282C3F]">{c.title}</h3>
                <p className="text-xs text-[#535766] mt-0.5">{c.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
