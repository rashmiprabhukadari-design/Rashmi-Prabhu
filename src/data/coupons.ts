import type { Banner, Coupon } from '../types';
import { MEDIA_ASSETS } from './mediaAssets';

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'STYLE200',
    title: 'Flat ₹200 Off',
    description: 'Valid on orders of ₹1,199 and above across all categories.',
    type: 'flat',
    value: 200,
    minOrderValue: 1199,
    active: true,
  },
  {
    code: 'FIRST300',
    title: 'Flat ₹300 Off (New Shopper)',
    description: 'Exclusive welcome offer on your first order above ₹1,499.',
    type: 'flat',
    value: 300,
    minOrderValue: 1499,
    firstOrderOnly: true,
    active: true,
  },
  {
    code: 'RUNWAY15',
    title: '15% Instant Discount',
    description: 'Get 15% off up to ₹600 on orders above ₹2,499.',
    type: 'percent',
    value: 15,
    minOrderValue: 2499,
    maxDiscount: 600,
    active: true,
  },
  {
    code: 'FREESHIP',
    title: 'Free Express Delivery',
    description: 'Waives ₹99 shipping fee on orders of ₹499 and above.',
    type: 'freeship',
    value: 99,
    minOrderValue: 499,
    active: true,
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    kicker: 'Autumn / Winter Runway',
    title: 'Tailored Crimson & Sculpted Silks',
    subtitle: 'Sharp suiting, pleated midi silhouettes & studio essentials at up to 50% off.',
    ctaLabel: 'Shop Women',
    ctaLink: '/women/all',
    image: MEDIA_ASSETS.heroRunwayWomen,
    accentColor: '#FF3F6C',
    active: true,
  },
  {
    id: 'ban-2',
    kicker: 'Urban Atelier Drop',
    title: 'Modern Menswear, Refined Daily',
    subtitle: 'Breathable linen overshirts, selvedge denim & structured bombers starting ₹1,199.',
    ctaLabel: 'Shop Men',
    ctaLink: '/men/all',
    image: MEDIA_ASSETS.heroStreetwearMen,
    accentColor: '#282C3F',
    active: true,
  },
  {
    id: 'ban-3',
    kicker: 'The Wedding & Festive Edit',
    title: 'Handcrafted Chanderi & Bandhgalas',
    subtitle: 'Celebrate the season in luminous silk blends, embroidered kurtas & curated gifting.',
    ctaLabel: 'Explore Festive',
    ctaLink: '/women/kurta-sets',
    image: MEDIA_ASSETS.heroEthnicFestive,
    accentColor: '#FF905A',
    active: true,
  },
];
