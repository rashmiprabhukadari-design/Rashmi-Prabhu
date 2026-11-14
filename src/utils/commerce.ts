import type {
  CartItem,
  Coupon,
  PriceBreakup,
  Product,
  ProductFilters,
} from '../types';

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 99;

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatRatingCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}

export function validateCoupon(
  coupon: Coupon | undefined,
  subtotal: number,
  isFirstOrder: boolean
): { valid: boolean; reason?: string } {
  if (!coupon || !coupon.active) {
    return { valid: false, reason: 'Coupon code is invalid or expired.' };
  }
  if (coupon.firstOrderOnly && !isFirstOrder) {
    return {
      valid: false,
      reason: `${coupon.code} is valid only on your first StyleKart order.`,
    };
  }
  if (subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      reason: `Add ${formatINR(coupon.minOrderValue - subtotal)} more to unlock ${coupon.code}.`,
    };
  }
  return { valid: true };
}

export function calculatePriceBreakup(
  cartItems: CartItem[],
  products: Product[],
  appliedCoupon: Coupon | null,
  isFirstOrder: boolean = true
): PriceBreakup {
  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalMrp = 0;
  let subtotal = 0;

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    totalMrp += product.mrp * item.quantity;
    subtotal += product.price * item.quantity;
  }

  const productDiscount = Math.max(0, totalMrp - subtotal);
  let couponDiscount = 0;
  let activeCouponCode: string | null = null;
  let freeShippingByCoupon = false;

  if (appliedCoupon && subtotal > 0) {
    const check = validateCoupon(appliedCoupon, subtotal, isFirstOrder);
    if (check.valid) {
      activeCouponCode = appliedCoupon.code;
      if (appliedCoupon.type === 'flat') {
        couponDiscount = Math.min(subtotal, appliedCoupon.value);
      } else if (appliedCoupon.type === 'percent') {
        const raw = Math.round((subtotal * appliedCoupon.value) / 100);
        couponDiscount = appliedCoupon.maxDiscount
          ? Math.min(raw, appliedCoupon.maxDiscount)
          : raw;
        couponDiscount = Math.min(subtotal, couponDiscount);
      } else if (appliedCoupon.type === 'freeship') {
        freeShippingByCoupon = true;
      }
    }
  }

  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const qualifiesFreeShipping =
    subtotal === 0 ||
    subtotal >= FREE_SHIPPING_THRESHOLD ||
    freeShippingByCoupon;
  const shippingFee = qualifiesFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const totalPayable = afterCoupon + shippingFee;
  const totalSavings =
    productDiscount + couponDiscount + (freeShippingByCoupon && subtotal < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0);
  const amountToFreeShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
      ? 0
      : FREE_SHIPPING_THRESHOLD - subtotal;

  return {
    totalMrp,
    productDiscount,
    subtotal,
    couponCode: activeCouponCode,
    couponDiscount,
    shippingFee,
    totalPayable,
    totalSavings,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
  };
}

export function validateLuhnCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function validateUpiId(upi: string): boolean {
  return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/.test(upi.trim());
}

export function checkPincodeServiceability(pincode: string): {
  serviceable: boolean;
  estimatedDate: string;
  codAvailable: boolean;
  cityHint: string;
  message: string;
} {
  const clean = pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(clean)) {
    return {
      serviceable: false,
      estimatedDate: '',
      codAvailable: false,
      cityHint: '',
      message: 'Please enter a valid 6-digit Indian pincode.',
    };
  }

  const firstDigit = Number(clean[0]);
  const metroPrefixes: Record<string, string> = {
    '1': 'Delhi NCR',
    '2': 'North Zone',
    '3': 'West Zone',
    '4': 'Mumbai / Pune',
    '5': 'Bengaluru / Hyderabad',
    '6': 'Chennai / South',
    '7': 'Kolkata / East',
    '8': 'Bihar / Jharkhand',
  };

  // Make remote 9xxxxx military/unserviceable for realistic edge test
  if (firstDigit === 9) {
    return {
      serviceable: false,
      estimatedDate: '',
      codAvailable: false,
      cityHint: 'Remote Zone',
      message: 'Sorry, delivery is currently unavailable for this pincode.',
    };
  }

  const daysToAdd = firstDigit === 4 || firstDigit === 5 || firstDigit === 1 ? 2 : 4;
  const target = new Date();
  target.setDate(target.getDate() + daysToAdd);
  const estimatedDate = target.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const codAvailable = Number(clean) % 10 !== 9;
  const cityHint = metroPrefixes[String(firstDigit)] ?? 'India Express';

  return {
    serviceable: true,
    estimatedDate,
    codAvailable,
    cityHint,
    message: `Express delivery by ${estimatedDate} (${cityHint})`,
  };
}

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  const query = filters.searchQuery?.trim().toLowerCase() ?? '';

  const filtered = products.filter((p) => {
    if (filters.gender && filters.gender !== 'all') {
      if (p.gender !== filters.gender) return false;
    }

    if (filters.category && filters.category !== 'all') {
      const catSlug = filters.category.toLowerCase();
      const matchesCat =
        p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catSlug ||
        p.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catSlug ||
        p.category.toLowerCase() === catSlug;
      if (!matchesCat) return false;
    }

    if (query) {
      const haystack = `${p.title} ${p.subtitle} ${p.brand} ${p.category} ${p.subcategory} ${p.tags.join(' ')} ${p.fabric}`.toLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      const matchesAll = terms.every((t) => haystack.includes(t));
      if (!matchesAll) return false;
    }

    if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) {
      return false;
    }

    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) {
      return false;
    }

    if (filters.colors.length > 0) {
      const hasColor = p.colors.some((c) => filters.colors.includes(c.name));
      if (!hasColor) return false;
    }

    if (filters.sizes.length > 0) {
      const hasAvailableSize = p.sizes.some(
        (s) => filters.sizes.includes(s.size) && s.stock > 0
      );
      if (!hasAvailableSize) return false;
    }

    if (filters.minDiscount > 0 && p.discountPercent < filters.minDiscount) {
      return false;
    }

    if (filters.minRating > 0 && p.rating < filters.minRating) {
      return false;
    }

    if (filters.fits.length > 0 && !filters.fits.includes(p.fit)) {
      return false;
    }

    if (filters.fabrics.length > 0 && !filters.fabrics.includes(p.fabric)) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered];
  switch (filters.sortBy) {
    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'discount':
      sorted.sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
      break;
    case 'newest':
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'recommended':
    default:
      sorted.sort(
        (a, b) =>
          (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) ||
          b.rating * Math.log10(b.ratingCount + 10) -
            a.rating * Math.log10(a.ratingCount + 10)
      );
      break;
  }

  return sorted;
}

export function calculateLoyaltyTier(points: number): {
  tier: 'Insider' | 'Select' | 'Runway Icon';
  nextTier: string | null;
  pointsToNext: number;
  perks: string[];
} {
  if (points >= 2500) {
    return {
      tier: 'Runway Icon',
      nextTier: null,
      pointsToNext: 0,
      perks: [
        'Free express shipping on all orders',
        'Early 24h access to seasonal drops',
        'Priority 48-hour refunds & VIP styling',
      ],
    };
  }
  if (points >= 1000) {
    return {
      tier: 'Select',
      nextTier: 'Runway Icon',
      pointsToNext: 2500 - points,
      perks: [
        'Complimentary festive gift wrapping',
        'Early access to Deal of the Day drops',
        '2x loyalty points on weekend orders',
      ],
    };
  }
  return {
    tier: 'Insider',
    nextTier: 'Select',
    pointsToNext: 1000 - points,
    perks: [
      'Earn 5 points per ₹100 spent',
      'Birthday month ₹500 voucher',
      'Exclusive member-only coupon codes',
    ],
  };
}

export function calculatePointsForOrder(totalPayable: number): number {
  return Math.max(10, Math.floor(totalPayable / 20));
}
