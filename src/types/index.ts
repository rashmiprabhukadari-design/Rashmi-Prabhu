export type GenderCategory =
  | 'men'
  | 'women'
  | 'kids'
  | 'footwear'
  | 'accessories'
  | 'beauty';

export type FitType = 'Slim' | 'Regular' | 'Relaxed' | 'Oversized' | 'Tailored';
export type FabricType =
  | 'Cotton'
  | 'Linen'
  | 'Silk Blend'
  | 'Denim'
  | 'Polyester'
  | 'Leather'
  | 'Botanical Formula'
  | 'Wool Blend';

export interface SizeStock {
  size: string;
  stock: number;
}

export interface ProductColorVariant {
  name: string;
  hex: string;
  images: string[];
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  sizePurchased?: string;
  helpfulCount: number;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  brand: string;
  gender: GenderCategory;
  category: string;
  subcategory: string;
  mrp: number;
  price: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  images: string[];
  colors: ProductColorVariant[];
  sizes: SizeStock[];
  fit: FitType;
  fabric: FabricType;
  description: string;
  highlights: string[];
  careInstructions: string;
  tags: string[];
  isTrending?: boolean;
  isDealOfDay?: boolean;
  priceDropFrom?: number;
  reviews: ProductReview[];
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  offerText: string;
  discountBadge: string;
  featuredGender: GenderCategory;
  image: string;
}

export interface CategoryTile {
  id: string;
  label: string;
  gender: GenderCategory;
  categorySlug: string;
  image: string;
  offerText: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  kicker: string;
  ctaLabel: string;
  ctaLink: string;
  image: string;
  accentColor: string;
  active: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
  addedPrice: number;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  type: 'flat' | 'percent' | 'freeship';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  firstOrderOnly?: boolean;
  active: boolean;
}

export interface PriceBreakup {
  totalMrp: number;
  productDiscount: number;
  subtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  shippingFee: number;
  totalPayable: number;
  totalSavings: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  houseLine: string;
  locality: string;
  city: string;
  state: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export type OrderStatus =
  | 'Placed'
  | 'Packed'
  | 'Shipped'
  | 'Out for delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested';

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'COD';

export interface OrderItemSnapshot {
  productId: string;
  title: string;
  brand: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  unitMrp: number;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  estimatedDelivery: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentLast4?: string;
  address: Address;
  items: OrderItemSnapshot[];
  priceBreakup: PriceBreakup;
  pointsEarned: number;
  cancellationReason?: string;
  returnReason?: string;
  returnType?: 'Return' | 'Exchange';
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'customer' | 'admin';
  loyaltyPoints: number;
  joinedAt: string;
}

export type SortOption =
  | 'recommended'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'discount'
  | 'rating';

export interface ProductFilters {
  gender?: GenderCategory | 'all';
  category?: string;
  searchQuery?: string;
  brands: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  minDiscount: number;
  minRating: number;
  fits: FitType[];
  fabrics: FabricType[];
  sortBy: SortOption;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AIStylistMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendedProductIds?: string[];
  stylingTips?: string[];
  timestamp: string;
}

export interface ReviewSummaryResult {
  overallSentiment: string;
  pros: string[];
  cons: string[];
  fitVerdict: string;
}

export interface SizeRecommendationResult {
  recommendedSize: string;
  confidence: string;
  reasoning: string;
  fitNotes: string;
}

export interface VisualSearchResult {
  detectedCategory: string;
  detectedColors: string[];
  styleKeywords: string[];
  summary: string;
  matchedProductIds: string[];
}
