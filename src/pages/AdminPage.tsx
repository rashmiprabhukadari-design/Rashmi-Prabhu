import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Image as ImageIcon,
  Layers,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useToastStore } from '../store/useToastStore';
import { formatINR } from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MEDIA_ASSETS } from '../data/mediaAssets';
import type {
  Banner,
  Coupon,
  GenderCategory,
  OrderStatus,
  Product,
} from '../types';
import { Modal } from '../components/common/Modal';
import { SafeImage } from '../components/common/SafeImage';

type AdminTab = 'overview' | 'products' | 'orders' | 'coupons' | 'banners';

const WEEKLY_REVENUE_DATA = [
  { day: 'Mon', revenue: 42800, orders: 18 },
  { day: 'Tue', revenue: 51200, orders: 22 },
  { day: 'Wed', revenue: 48600, orders: 20 },
  { day: 'Thu', revenue: 69400, orders: 29 },
  { day: 'Fri', revenue: 84200, orders: 36 },
  { day: 'Sat', revenue: 112500, orders: 49 },
  { day: 'Sun', revenue: 96300, orders: 41 },
];

export default function AdminPage() {
  useDocumentTitle('Admin Console');
  const { user, isAuthenticated, loginWithOtp } = useAuthStore();
  const {
    products,
    orders,
    coupons,
    banners,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    addCoupon,
    toggleCoupon,
    deleteCoupon,
    addBanner,
    updateBanner,
    deleteBanner,
  } = useCatalogStore();
  const showToast = useToastStore((s) => s.showToast);

  const [tab, setTab] = useState<AdminTab>('overview');

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pTitle, setPTitle] = useState('');
  const [pBrand, setPBrand] = useState('AURELIA STUDIO');
  const [pGender, setPGender] = useState<GenderCategory>('women');
  const [pCategory, setPCategory] = useState('dresses');
  const [pMrp, setPMrp] = useState(2999);
  const [pPrice, setPPrice] = useState(1799);
  const [pImage, setPImage] = useState<string>(MEDIA_ASSETS.prodWomensDress);
  const [pColors, setPColors] = useState('Coral Rose:#E07A6B, Ivory:#FAF8F5');
  const [pSizes, setPSizes] = useState('S:10, M:15, L:8, XL:5');

  // Coupon Form State
  const [cCode, setCCode] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [cType, setCType] = useState<'flat' | 'percent' | 'freeship'>('flat');
  const [cValue, setCValue] = useState(250);
  const [cMinOrder, setCMinOrder] = useState(1299);

  // Banner Form State
  const [bKicker, setBKicker] = useState('');
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bCtaLabel, setBCtaLabel] = useState('Shop Now');
  const [bCtaLink, setBCtaLink] = useState('/women/all');
  const [bImage, setBImage] = useState<string>(MEDIA_ASSETS.heroRunwayWomen);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.gender, (counts.get(p.gender) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([dept, skus]) => ({
      department: dept.toUpperCase(),
      skus,
    }));
  }, [products]);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.priceBreakup.totalPayable, 0) + 485000,
    [orders]
  );

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="sk-container px-4 py-16 max-w-lg mx-auto">
        <div className="p-8 border border-[#EAEAEC] rounded-lg bg-white text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#14958F]/10 text-[#14958F] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#282C3F]">
            Admin Console Access Required
          </h1>
          <p className="text-xs text-[#535766] leading-relaxed">
            This dashboard is protected. Sign in with an administrator account to manage StyleKart products, orders, coupons, and campaign banners.
          </p>
          <button
            type="button"
            onClick={() => {
              loginWithOtp('9999999999', 'admin');
              showToast('Signed in as StyleKart Admin');
            }}
            className="h-11 px-6 rounded-lg bg-[#282C3F] hover:bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Sign in as Demo Admin
          </button>
        </div>
      </div>
    );
  }

  const openNewProduct = () => {
    setEditingProduct(null);
    setPTitle('');
    setPBrand('VERVE COUTURE');
    setPGender('women');
    setPCategory('dresses');
    setPMrp(2999);
    setPPrice(1799);
    setPImage(MEDIA_ASSETS.prodWomensDress);
    setPColors('Coral Rose:#E07A6B, Ivory:#FAF8F5');
    setPSizes('S:10, M:15, L:8, XL:5');
    setProductModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setPTitle(p.title);
    setPBrand(p.brand);
    setPGender(p.gender);
    setPCategory(p.category);
    setPMrp(p.mrp);
    setPPrice(p.price);
    setPImage(p.images[0]);
    setPColors(p.colors.map((c) => `${c.name}:${c.hex}`).join(', '));
    setPSizes(p.sizes.map((s) => `${s.size}:${s.stock}`).join(', '));
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim() || pPrice <= 0 || pMrp < pPrice) {
      showToast('Ensure title is filled and MRP >= Selling Price', 'error');
      return;
    }

    const parsedColors = pColors
      .split(',')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [name, hex] = chunk.split(':').map((s) => s.trim());
        return { name: name || 'Standard', hex: hex || '#282C3F', images: [pImage] };
      });

    const parsedSizes = pSizes
      .split(',')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [size, stock] = chunk.split(':').map((s) => s.trim());
        return { size: size || 'M', stock: Number(stock) || 10 };
      });

    const discountPercent = Math.round(((pMrp - pPrice) / pMrp) * 100);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        title: pTitle.trim(),
        brand: pBrand.trim().toUpperCase(),
        gender: pGender,
        category: pCategory.trim().toLowerCase(),
        mrp: Number(pMrp),
        price: Number(pPrice),
        discountPercent,
        images: [pImage, editingProduct.images[1] || pImage],
        colors: parsedColors.length ? parsedColors : editingProduct.colors,
        sizes: parsedSizes.length ? parsedSizes : editingProduct.sizes,
      });
      showToast('Product updated');
    } else {
      const created: Product = {
        id: `sk-adm-${Date.now()}`,
        sku: `SK-${Math.floor(2000 + Math.random() * 8000)}`,
        title: pTitle.trim(),
        subtitle: `${pBrand.trim()} Curated Season Release`,
        brand: pBrand.trim().toUpperCase(),
        gender: pGender,
        category: pCategory.trim().toLowerCase(),
        subcategory: pCategory.trim().toLowerCase(),
        mrp: Number(pMrp),
        price: Number(pPrice),
        discountPercent,
        rating: 4.5,
        ratingCount: 120,
        images: [pImage, pImage],
        colors: parsedColors.length
          ? parsedColors
          : [{ name: 'Standard', hex: '#282C3F', images: [pImage] }],
        sizes: parsedSizes.length ? parsedSizes : [{ size: 'M', stock: 12 }],
        fit: 'Regular',
        fabric: 'Cotton',
        description: `${pTitle.trim()} crafted with premium finishing by ${pBrand.trim()}.`,
        highlights: ['Admin curated SKU', '14-day easy returns'],
        careInstructions: 'Machine wash cold.',
        tags: [pGender, pCategory.toLowerCase()],
        isTrending: true,
        reviews: [],
        createdAt: new Date().toISOString(),
      };
      addProduct(created);
      showToast('New product added to live catalog');
    }
    setProductModalOpen(false);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim() || !cTitle.trim()) return;
    const newCoupon: Coupon = {
      code: cCode.trim().toUpperCase(),
      title: cTitle.trim(),
      description: `Valid on orders above ${formatINR(cMinOrder)}.`,
      type: cType,
      value: Number(cValue),
      minOrderValue: Number(cMinOrder),
      active: true,
    };
    addCoupon(newCoupon);
    setCCode('');
    setCTitle('');
    showToast(`Coupon ${newCoupon.code} created`);
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim()) return;
    const newBanner: Banner = {
      id: `ban-${Date.now()}`,
      kicker: bKicker.trim() || 'Featured Drop',
      title: bTitle.trim(),
      subtitle: bSubtitle.trim() || 'Explore the latest arrivals on StyleKart.',
      ctaLabel: bCtaLabel.trim() || 'Shop Now',
      ctaLink: bCtaLink.trim() || '/women/all',
      image: bImage,
      accentColor: '#FF3F6C',
      active: true,
    };
    addBanner(newBanner);
    setBKicker('');
    setBTitle('');
    setBSubtitle('');
    showToast('Banner added to homepage carousel');
  };

  return (
    <div className="sk-container px-4 md:px-10 py-8 pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAEAEC] pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#14958F]">
            Protected Storefront Console
          </p>
          <h1 className="text-2xl font-extrabold text-[#282C3F]">
            StyleKart Admin Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-[#F5F5F6] p-1 rounded-lg">
          {(
            [
              { id: 'overview', label: 'Analytics', icon: Layers },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'coupons', label: 'Coupons', icon: Tag },
              { id: 'banners', label: 'Banners', icon: ImageIcon },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  tab === t.id
                    ? 'bg-white text-[#FF3F6C] shadow-sm'
                    : 'text-[#535766] hover:text-[#282C3F]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="p-4 border border-[#EAEAEC] rounded-lg bg-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#535766]">
            Gross Revenue (7D)
          </p>
          <p className="text-2xl font-extrabold text-[#282C3F] mt-1">
            {formatINR(totalRevenue)}
          </p>
          <p className="text-[11px] font-semibold text-[#14958F] mt-1">
            +18.4% vs last week
          </p>
        </div>
        <div className="p-4 border border-[#EAEAEC] rounded-lg bg-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#535766]">
            Live Orders
          </p>
          <p className="text-2xl font-extrabold text-[#282C3F] mt-1">
            {orders.length}
          </p>
          <p className="text-[11px] text-[#535766] mt-1">
            {orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length} active shipments
          </p>
        </div>
        <div className="p-4 border border-[#EAEAEC] rounded-lg bg-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#535766]">
            Active Catalog SKUs
          </p>
          <p className="text-2xl font-extrabold text-[#282C3F] mt-1">
            {products.length}
          </p>
          <p className="text-[11px] text-[#535766] mt-1">Across 6 departments</p>
        </div>
        <div className="p-4 border border-[#EAEAEC] rounded-lg bg-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#535766]">
            Active Coupons
          </p>
          <p className="text-2xl font-extrabold text-[#282C3F] mt-1">
            {coupons.filter((c) => c.active).length}
          </p>
          <p className="text-[11px] text-[#FF905A] font-semibold mt-1">
            {banners.filter((b) => b.active).length} live hero banners
          </p>
        </div>
      </div>

      {/* TAB: ANALYTICS */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 border border-[#EAEAEC] rounded-lg bg-white space-y-4">
            <h2 className="text-sm font-bold text-[#282C3F]">
              Weekly Revenue Trend (INR)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEC" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#535766' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#535766' }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF3F6C"
                    fill="#FFF0F4"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 border border-[#EAEAEC] rounded-lg bg-white space-y-4">
            <h2 className="text-sm font-bold text-[#282C3F]">
              Catalog SKUs by Department
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEC" />
                  <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#535766' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#535766' }} />
                  <Tooltip />
                  <Bar dataKey="skus" fill="#282C3F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PRODUCTS */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#282C3F]">
              Product Catalog ({products.length})
            </h2>
            <button
              type="button"
              onClick={openNewProduct}
              className="h-10 px-4 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="border border-[#EAEAEC] rounded-lg bg-white overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="bg-[#F5F5F6] border-b border-[#EAEAEC] text-[#535766] uppercase text-[11px]">
                  <th className="p-3">Product</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Price / MRP</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEC]">
                {products.slice(0, 25).map((p) => {
                  const totalStock = p.sizes.reduce((s, x) => s + x.stock, 0);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8FF]">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={p.images[0]}
                            alt={p.title}
                            className="w-10 h-12 object-cover rounded border border-[#EAEAEC] shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#282C3F]">{p.brand}</p>
                            <p className="text-[#535766]">{p.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 capitalize text-[#535766]">
                        {p.gender} / {p.category}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-[#282C3F]">
                          {formatINR(p.price)}
                        </span>{' '}
                        <span className="line-through text-[#94969F]">
                          {formatINR(p.mrp)}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-[#14958F]">
                        {totalStock} units
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditProduct(p)}
                          aria-label={`Edit ${p.title}`}
                          className="p-1.5 rounded border border-[#EAEAEC] text-[#282C3F] hover:border-[#282C3F] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteProduct(p.id);
                            showToast(`Deleted ${p.title}`, 'info');
                          }}
                          aria-label={`Delete ${p.title}`}
                          className="p-1.5 rounded border border-[#EAEAEC] text-[#ba1a1a] hover:border-[#ba1a1a] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ORDERS */}
      {tab === 'orders' && (
        <div className="border border-[#EAEAEC] rounded-lg bg-white overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse tabular-nums">
            <thead>
              <tr className="bg-[#F5F5F6] border-b border-[#EAEAEC] text-[#535766] uppercase text-[11px]">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEC]">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 font-mono-tabular font-bold text-[#282C3F]">
                    {o.id}
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-[#282C3F]">{o.address.fullName}</p>
                    <p className="text-[#535766]">
                      {o.address.city} ({o.paymentMethod})
                    </p>
                  </td>
                  <td className="p-3 text-[#535766]">{o.items.length} item(s)</td>
                  <td className="p-3 font-bold text-[#282C3F]">
                    {formatINR(o.priceBreakup.totalPayable)}
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`Order status for ${o.id}`}
                      value={o.status}
                      onChange={(e) => {
                        updateOrderStatus(o.id, e.target.value as OrderStatus);
                        showToast(`Order ${o.id} status updated`);
                      }}
                      className="h-9 px-2.5 rounded border border-[#EAEAEC] text-xs font-bold text-[#282C3F]"
                    >
                      {[
                        'Placed',
                        'Packed',
                        'Shipped',
                        'Out for delivery',
                        'Delivered',
                        'Cancelled',
                        'Return Requested',
                      ].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: COUPONS */}
      {tab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddCoupon}
            className="lg:col-span-4 p-5 border border-[#EAEAEC] rounded-lg bg-white space-y-3 text-xs h-fit"
          >
            <h2 className="text-sm font-bold text-[#282C3F]">Create Coupon</h2>
            <input
              type="text"
              required
              placeholder="Code (e.g. FESTIVE250)"
              value={cCode}
              onChange={(e) => setCCode(e.target.value.toUpperCase())}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC] font-mono-tabular uppercase"
            />
            <input
              type="text"
              required
              placeholder="Title (e.g. Flat ₹250 Off)"
              value={cTitle}
              onChange={(e) => setCTitle(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={cType}
                onChange={(e) =>
                  setCType(e.target.value as 'flat' | 'percent' | 'freeship')
                }
                className="h-10 px-2 rounded border border-[#EAEAEC]"
              >
                <option value="flat">Flat ₹ Off</option>
                <option value="percent">% Off</option>
                <option value="freeship">Free Shipping</option>
              </select>
              <input
                type="number"
                value={cValue}
                onChange={(e) => setCValue(Number(e.target.value))}
                placeholder="Value"
                className="h-10 px-3 rounded border border-[#EAEAEC] tabular-nums"
              />
            </div>
            <input
              type="number"
              value={cMinOrder}
              onChange={(e) => setCMinOrder(Number(e.target.value))}
              placeholder="Min Order ₹"
              className="w-full h-10 px-3 rounded border border-[#EAEAEC] tabular-nums"
            />
            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-[#FF3F6C] text-white font-bold uppercase tracking-wider cursor-pointer"
            >
              Add Coupon
            </button>
          </form>

          <div className="lg:col-span-8 space-y-3">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="p-4 border border-[#EAEAEC] rounded-lg bg-white flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <p className="font-mono-tabular text-sm font-bold text-[#282C3F]">
                    {c.code}{' '}
                    <span className="text-[11px] font-sans font-semibold text-[#14958F]">
                      ({c.active ? 'Active' : 'Paused'})
                    </span>
                  </p>
                  <p className="text-[#535766]">
                    {c.title} · Min order {formatINR(c.minOrderValue)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCoupon(c.code)}
                    className="h-8 px-3 rounded border border-[#EAEAEC] font-bold cursor-pointer"
                  >
                    {c.active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCoupon(c.code)}
                    aria-label={`Delete coupon ${c.code}`}
                    className="p-1.5 text-[#ba1a1a] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: BANNERS */}
      {tab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddBanner}
            className="lg:col-span-4 p-5 border border-[#EAEAEC] rounded-lg bg-white space-y-3 text-xs h-fit"
          >
            <h2 className="text-sm font-bold text-[#282C3F]">Add Hero Banner</h2>
            <input
              type="text"
              placeholder="Kicker (e.g. Weekend Drop)"
              value={bKicker}
              onChange={(e) => setBKicker(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
            <input
              type="text"
              required
              placeholder="Headline *"
              value={bTitle}
              onChange={(e) => setBTitle(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
            <input
              type="text"
              placeholder="Subtitle"
              value={bSubtitle}
              onChange={(e) => setBSubtitle(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="CTA Label"
                value={bCtaLabel}
                onChange={(e) => setBCtaLabel(e.target.value)}
                className="h-10 px-3 rounded border border-[#EAEAEC]"
              />
              <input
                type="text"
                placeholder="CTA Link"
                value={bCtaLink}
                onChange={(e) => setBCtaLink(e.target.value)}
                className="h-10 px-3 rounded border border-[#EAEAEC]"
              />
            </div>
            <input
              type="text"
              placeholder="Image URL"
              value={bImage}
              onChange={(e) => setBImage(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-[#FF3F6C] text-white font-bold uppercase tracking-wider cursor-pointer"
            >
              Publish Banner
            </button>
          </form>

          <div className="lg:col-span-8 space-y-3">
            {banners.map((b) => (
              <div
                key={b.id}
                className="p-4 border border-[#EAEAEC] rounded-lg bg-white flex items-center gap-4 text-xs"
              >
                <SafeImage
                  src={b.image}
                  alt={b.title}
                  className="w-28 h-16 object-cover rounded border border-[#EAEAEC] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase text-[#FF3F6C]">
                    {b.kicker}
                  </p>
                  <p className="font-bold text-sm text-[#282C3F] truncate">
                    {b.title}
                  </p>
                  <p className="text-[#535766] truncate">{b.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateBanner({ ...b, active: !b.active })}
                    className="h-8 px-3 rounded border border-[#EAEAEC] font-bold cursor-pointer"
                  >
                    {b.active ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBanner(b.id)}
                    aria-label={`Delete banner ${b.title}`}
                    className="p-1.5 text-[#ba1a1a] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product CRUD Modal */}
      <Modal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={pTitle}
              onChange={(e) => setPTitle(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Brand *</label>
              <input
                type="text"
                required
                value={pBrand}
                onChange={(e) => setPBrand(e.target.value)}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Department</label>
              <select
                value={pGender}
                onChange={(e) => setPGender(e.target.value as GenderCategory)}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
                <option value="footwear">Footwear</option>
                <option value="accessories">Accessories</option>
                <option value="beauty">Beauty</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold mb-1">Category</label>
              <input
                type="text"
                value={pCategory}
                onChange={(e) => setPCategory(e.target.value)}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">MRP (₹)</label>
              <input
                type="number"
                value={pMrp}
                onChange={(e) => setPMrp(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC] tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={pPrice}
                onChange={(e) => setPPrice(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC] tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold mb-1">Image URL</label>
            <input
              type="text"
              value={pImage}
              onChange={(e) => setPImage(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">
              Color Variants (Name:#Hex, ...)
            </label>
            <input
              type="text"
              value={pColors}
              onChange={(e) => setPColors(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">
              Size &amp; Stock (Size:Qty, ...)
            </label>
            <input
              type="text"
              value={pSizes}
              onChange={(e) => setPSizes(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#FF3F6C] text-white font-bold uppercase tracking-wider cursor-pointer"
          >
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
