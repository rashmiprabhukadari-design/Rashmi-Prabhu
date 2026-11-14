import { NavLink, Outlet } from 'react-router-dom';
import { Award, LogOut, MapPin, Package, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const NAV_ITEMS = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/orders', label: 'Orders & Returns', icon: Package },
  { to: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { to: '/account/profile', label: 'Profile Details', icon: User },
  { to: '/account/rewards', label: 'Coupons & Rewards', icon: Award },
];

export default function AccountLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="sk-container px-4 md:px-10 py-8 pb-20">
      <div className="pb-5 mb-6 border-b border-[#EAEAEC] flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#282C3F]">Account</h1>
          <p className="text-xs text-[#535766]">
            {user?.name} · {user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#EAEAEC] text-xs font-bold text-[#FF3F6C] hover:border-[#FF3F6C] cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 border border-[#EAEAEC] rounded bg-white overflow-hidden">
          <nav aria-label="Account navigation" className="flex lg:flex-col overflow-x-auto no-scrollbar divide-x lg:divide-x-0 lg:divide-y divide-[#EAEAEC]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#FFF0F4] text-[#FF3F6C]'
                        : 'text-[#282C3F] hover:bg-[#F5F5F6]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="lg:col-span-9 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
