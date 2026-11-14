import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  ChevronDown,
  Clock,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { MEGA_MENU_DATA } from '../../data/categories';
import { catalogService } from '../../services/catalogService';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDebounce } from '../../hooks/useDebounce';
import { formatINR } from '../../utils/commerce';
import { SafeImage } from '../common/SafeImage';

const TRENDING_SEARCHES = [
  'Linen Shirt',
  'Pleated Midi Dress',
  'Court Sneakers',
  'Chanderi Kurta',
  'Chronograph Watch',
  'Botanical Serum',
];

export function Header() {
  const navigate = useNavigate();
  const bagCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, isAuthenticated, recentSearches, addRecentSearch, clearRecentSearches, logout } =
    useAuthStore();

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchTerm, 220);

  const suggestions = debouncedQuery.trim()
    ? catalogService.getSearchSuggestions(debouncedQuery)
    : { products: [], brands: [], categories: [] };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) {
      navigate('/search');
      setSearchFocused(false);
      return;
    }
    addRecentSearch(q);
    setSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const goToSearch = (term: string) => {
    setSearchTerm(term);
    addRecentSearch(term);
    setSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const activeMenuSection = MEGA_MENU_DATA.find((m) => m.gender === activeMegaMenu);

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-white border-b border-[#EAEAEC] no-print"
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="sk-container h-14 md:h-[68px] px-4 md:px-8 flex items-center justify-between gap-4 lg:gap-8">
          {/* Left: Mobile hamburger + Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-9 h-9 -ml-1.5 flex items-center justify-center rounded-md text-[#282C3F] hover:bg-[#F5F5F6]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 whitespace-nowrap shrink-0"
              aria-label="StyleKart Home"
            >
              <span className="w-8 h-8 rounded-md bg-[#FF3F6C] text-white font-extrabold text-sm flex items-center justify-center tracking-tighter">
                SK
              </span>
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-[#282C3F]">
                Style<span className="text-[#FF3F6C]">Kart</span>
              </span>
            </Link>
          </div>

          {/* Center-Left: Desktop Department Navigation */}
          <nav
            aria-label="Shop by department"
            className="hidden lg:flex items-center gap-6 h-full"
          >
            {MEGA_MENU_DATA.map((section) => {
              const isActive = activeMegaMenu === section.gender;
              return (
                <div
                  key={section.gender}
                  className="h-full flex items-center"
                  onMouseEnter={() => setActiveMegaMenu(section.gender)}
                >
                  <Link
                    to={`/${section.gender}/all`}
                    onClick={() => setActiveMegaMenu(null)}
                    className={`relative h-full flex items-center text-xs font-bold uppercase tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#FF3F6C]'
                        : 'text-[#282C3F] hover:text-[#FF3F6C]'
                    }`}
                  >
                    {section.label}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-[3px] bg-[#FF3F6C]" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Center-Right: Search Bar with Auto-Suggest + Visual Search */}
          <div
            ref={searchContainerRef}
            className="relative flex-1 max-w-md hidden sm:block"
          >
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search
                className="w-4 h-4 text-[#535766] absolute left-3.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search for shirts, dresses, brands & more"
                aria-label="Search products, brands and categories"
                className={`w-full h-10 pl-10 pr-10 rounded text-sm text-[#282C3F] placeholder-[#94969F] transition-colors outline-none ${
                  searchFocused
                    ? 'bg-white border border-[#EAEAEC] shadow-sm'
                    : 'bg-[#F5F5F6] border border-transparent hover:bg-[#EFEFF1]'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  setSearchFocused(false);
                  navigate('/search?visual=1');
                }}
                aria-label="Visual search by photo"
                title="Visual Search with AI"
                className="absolute right-2.5 w-7 h-7 rounded flex items-center justify-center text-[#535766] hover:text-[#FF3F6C] hover:bg-[#FFF0F4] transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </form>

            {/* Search Dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#EAEAEC] rounded-lg shadow-xl overflow-hidden z-50">
                {debouncedQuery.trim() ? (
                  <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                    {suggestions.brands.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#94969F] px-2 mb-1">
                          Brands
                        </p>
                        <div className="flex flex-wrap gap-1.5 px-2">
                          {suggestions.brands.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => goToSearch(b.name)}
                              className="px-2.5 py-1 rounded bg-[#F5F5F6] hover:bg-[#FFF0F4] hover:text-[#FF3F6C] text-xs font-semibold text-[#282C3F] cursor-pointer"
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.categories.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#94969F] px-2 mb-1">
                          Categories
                        </p>
                        <div className="space-y-0.5">
                          {suggestions.categories.map((c) => (
                            <Link
                              key={`${c.gender}-${c.category}`}
                              to={`/${c.gender}/${c.category}`}
                              onClick={() => setSearchFocused(false)}
                              className="block px-2 py-1.5 rounded text-xs font-medium text-[#282C3F] hover:bg-[#F5F5F6] capitalize"
                            >
                              {c.gender} · {c.category.replace(/-/g, ' ')}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.products.length > 0 ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#94969F] px-2 mb-1">
                          Products
                        </p>
                        <div className="divide-y divide-[#F5F5F6]">
                          {suggestions.products.map((p) => (
                            <Link
                              key={p.id}
                              to={`/product/${p.id}`}
                              onClick={() => {
                                addRecentSearch(p.title);
                                setSearchFocused(false);
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-[#F5F5F6] rounded transition-colors"
                            >
                              <SafeImage
                                src={p.images[0]}
                                alt={p.title}
                                className="w-10 h-12 object-cover rounded shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold uppercase text-[#535766] truncate">
                                  {p.brand}
                                </p>
                                <p className="text-xs font-medium text-[#282C3F] truncate">
                                  {p.title}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-[#282C3F] tabular-nums shrink-0">
                                {formatINR(p.price)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      suggestions.brands.length === 0 && (
                        <p className="text-xs text-[#535766] px-2 py-3 text-center">
                          No instant matches for &ldquo;{debouncedQuery}&rdquo;. Press Enter for full search.
                        </p>
                      )
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#535766] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            Recent Searches
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-[11px] font-semibold text-[#FF3F6C] hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => goToSearch(term)}
                              className="px-3 py-1.5 rounded-full border border-[#EAEAEC] text-xs font-medium text-[#282C3F] hover:border-[#282C3F] cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#535766] flex items-center gap-1.5 mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-[#FF905A]" aria-hidden="true" />
                        Trending Searches
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => goToSearch(term)}
                            className="px-3 py-1.5 rounded-full bg-[#F5F5F6] text-xs font-medium text-[#282C3F] hover:bg-[#FFF0F4] hover:text-[#FF3F6C] cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Action Icons (Profile, Wishlist, Bag) */}
          <div className="flex items-center gap-1 md:gap-4 shrink-0">
            <Link
              to="/search"
              aria-label="Search"
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-md text-[#282C3F] hover:bg-[#F5F5F6]"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Profile Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProfileMenuOpen(true)}
              onMouseLeave={() => setProfileMenuOpen(false)}
            >
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                aria-label={isAuthenticated ? 'My Account' : 'Login or Sign Up'}
                className="flex flex-col items-center justify-center px-2 py-1 text-[#282C3F] hover:text-[#FF3F6C] transition-colors"
              >
                <User className="w-5 h-5" aria-hidden="true" />
                <span className="hidden md:block text-[10px] font-bold tracking-wide mt-0.5 whitespace-nowrap">
                  {isAuthenticated ? user?.name.split(' ')[0] : 'Profile'}
                </span>
              </Link>

              {profileMenuOpen && (
                <div className="hidden md:block absolute right-0 top-full pt-1 w-60 z-50">
                  <div className="bg-white border border-[#EAEAEC] rounded-lg shadow-xl p-4 space-y-3">
                    {isAuthenticated && user ? (
                      <>
                        <div className="pb-2.5 border-b border-[#EAEAEC]">
                          <p className="text-sm font-bold text-[#282C3F]">{user.name}</p>
                          <p className="text-xs text-[#535766]">{user.phone}</p>
                        </div>
                        <div className="space-y-1.5 text-xs font-medium text-[#282C3F]">
                          <Link to="/account" className="block py-1 hover:text-[#FF3F6C]">
                            Account Overview
                          </Link>
                          <Link to="/account/orders" className="block py-1 hover:text-[#FF3F6C]">
                            Orders & Returns
                          </Link>
                          <Link to="/account/rewards" className="block py-1 hover:text-[#FF3F6C]">
                            StyleKart Rewards ({user.loyaltyPoints} pts)
                          </Link>
                          <Link to="/account/addresses" className="block py-1 hover:text-[#FF3F6C]">
                            Saved Addresses
                          </Link>
                          <Link
                            to="/admin"
                            className="flex items-center gap-1.5 py-1 text-[#14958F] font-semibold hover:underline"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Console
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setProfileMenuOpen(false);
                          }}
                          className="w-full pt-2 border-t border-[#EAEAEC] text-left text-xs font-bold text-[#FF3F6C] hover:underline cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-bold text-[#282C3F]">Welcome</p>
                          <p className="text-xs text-[#535766]">
                            Access orders, saved addresses &amp; rewards
                          </p>
                        </div>
                        <Link
                          to="/login"
                          className="block w-full text-center py-2 rounded border border-[#EAEAEC] text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:border-[#FF3F6C]"
                        >
                          Login / Sign Up
                        </Link>
                        <div className="pt-2 border-t border-[#EAEAEC] space-y-1.5 text-xs text-[#535766]">
                          <Link to="/account/orders" className="block hover:text-[#282C3F]">
                            Track Orders
                          </Link>
                          <Link to="/admin" className="block hover:text-[#282C3F]">
                            Admin Panel
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative flex flex-col items-center justify-center px-2 py-1 text-[#282C3F] hover:text-[#FF3F6C] transition-colors"
            >
              <div className="relative">
                <Heart className="w-5 h-5" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF3F6C] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-[10px] font-bold tracking-wide mt-0.5">
                Wishlist
              </span>
            </Link>

            {/* Bag */}
            <Link
              to="/bag"
              aria-label={`Shopping Bag (${bagCount} items)`}
              className="relative flex flex-col items-center justify-center px-2 py-1 text-[#282C3F] hover:text-[#FF3F6C] transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                {bagCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF3F6C] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {bagCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-[10px] font-bold tracking-wide mt-0.5">
                Bag
              </span>
            </Link>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        {activeMenuSection && (
          <div className="hidden lg:block absolute left-0 right-0 top-full bg-white border-b border-[#EAEAEC] shadow-lg z-40">
            <div className="sk-container px-8 py-6 grid grid-cols-12 gap-8">
              <div className="col-span-8 grid grid-cols-3 gap-6">
                {activeMenuSection.groups.map((grp) => (
                  <div key={grp.heading}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] mb-3">
                      {grp.heading}
                    </h4>
                    <ul className="space-y-2">
                      {grp.items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            to={`/${activeMenuSection.gender}/${item.slug}`}
                            onClick={() => setActiveMegaMenu(null)}
                            className="text-sm text-[#535766] hover:text-[#282C3F] hover:font-semibold transition-colors"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#282C3F] mb-3">
                    Curated Edits
                  </h4>
                  <ul className="space-y-2 text-sm text-[#535766]">
                    <li>
                      <Link
                        to={`/${activeMenuSection.gender}/all`}
                        onClick={() => setActiveMegaMenu(null)}
                        className="hover:text-[#FF3F6C] font-semibold"
                      >
                        Shop All {activeMenuSection.label}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={`/${activeMenuSection.gender}/all?sort=discount`}
                        onClick={() => setActiveMegaMenu(null)}
                        className="hover:text-[#FF3F6C]"
                      >
                        Best Deals &amp; Offers
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={`/${activeMenuSection.gender}/all?sort=rating`}
                        onClick={() => setActiveMegaMenu(null)}
                        className="hover:text-[#FF3F6C]"
                      >
                        Top Rated Picks
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-span-4 flex items-center gap-4 bg-[#F5F5F6] rounded p-4">
                <SafeImage
                  src={activeMenuSection.featuredImage}
                  alt={activeMenuSection.label}
                  className="w-24 h-32 object-cover rounded shrink-0"
                />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF3F6C]">
                    Season Highlight
                  </p>
                  <p className="text-base font-bold text-[#282C3F] mt-1">
                    {activeMenuSection.label}&apos;s Runway Edit
                  </p>
                  <Link
                    to={`/${activeMenuSection.gender}/all`}
                    onClick={() => setActiveMegaMenu(null)}
                    className="inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-wider text-[#282C3F] underline underline-offset-4 hover:text-[#FF3F6C]"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-white flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 bg-[#282C3F] text-white">
              <div>
                <p className="text-sm font-bold">
                  {isAuthenticated && user ? `Hello, ${user.name}` : 'Welcome to StyleKart'}
                </p>
                <p className="text-xs text-white/75">
                  {isAuthenticated ? `${user?.loyaltyPoints} Rewards Points` : 'Sign in for offers & orders'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1">
              <div className="space-y-1">
                {MEGA_MENU_DATA.map((sec) => (
                  <details key={sec.gender} className="group border-b border-[#EAEAEC] pb-2">
                    <summary className="flex items-center justify-between py-2 text-sm font-bold text-[#282C3F] cursor-pointer list-none">
                      <span>{sec.label}</span>
                      <ChevronDown className="w-4 h-4 text-[#535766] group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="pl-3 pb-2 space-y-1.5">
                      <Link
                        to={`/${sec.gender}/all`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1 text-xs font-bold text-[#FF3F6C]"
                      >
                        Shop All {sec.label}
                      </Link>
                      {sec.groups.flatMap((g) => g.items).map((item) => (
                        <Link
                          key={item.slug}
                          to={`/${sec.gender}/${item.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1 text-xs text-[#535766]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
              </div>

              <div className="space-y-2 pt-2 text-sm font-medium text-[#282C3F]">
                <Link
                  to="/search?visual=1"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2"
                >
                  <Camera className="w-4 h-4 text-[#FF3F6C]" />
                  AI Visual Search
                </Link>
                <Link
                  to="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2"
                >
                  My Orders &amp; Returns
                </Link>
                <Link
                  to="/account/rewards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2"
                >
                  Rewards &amp; Coupons
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-[#14958F] font-semibold"
                >
                  Admin Console
                </Link>
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 mt-3 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Login / Sign Up
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-xs font-bold text-[#FF3F6C]"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
