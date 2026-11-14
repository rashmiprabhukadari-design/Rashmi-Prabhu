import type { CategoryTile, GenderCategory } from '../types';
import { MEDIA_ASSETS } from './mediaAssets';

export interface MegaMenuSection {
  gender: GenderCategory;
  label: string;
  featuredImage: string;
  groups: {
    heading: string;
    items: { label: string; slug: string }[];
  }[];
}

export const MEGA_MENU_DATA: MegaMenuSection[] = [
  {
    gender: 'men',
    label: 'Men',
    featuredImage: MEDIA_ASSETS.prodMensShirt,
    groups: [
      {
        heading: 'Topwear',
        items: [
          { label: 'Casual Shirts', slug: 'shirts' },
          { label: 'T-Shirts & Polos', slug: 't-shirts' },
          { label: 'Jackets & Bombers', slug: 'jackets' },
          { label: 'Blazers & Suits', slug: 'blazers' },
        ],
      },
      {
        heading: 'Bottomwear & Ethnic',
        items: [
          { label: 'Chinos & Trousers', slug: 'trousers' },
          { label: 'Selvedge Jeans', slug: 'jeans' },
          { label: 'Festive Kurtas', slug: 'kurtas' },
        ],
      },
    ],
  },
  {
    gender: 'women',
    label: 'Women',
    featuredImage: MEDIA_ASSETS.prodWomensDress,
    groups: [
      {
        heading: 'Western Wear',
        items: [
          { label: 'Dresses & Jumpsuits', slug: 'dresses' },
          { label: 'Tops & Shirts', slug: 'tops' },
          { label: 'Blazers & Coats', slug: 'blazers' },
          { label: 'Trousers & Jeans', slug: 'trousers' },
        ],
      },
      {
        heading: 'Ethnic & Fusion',
        items: [
          { label: 'Kurta Sets', slug: 'kurta-sets' },
          { label: 'Festive Sarees', slug: 'sarees' },
          { label: 'Anarkalis & Lehengas', slug: 'ethnic' },
        ],
      },
    ],
  },
  {
    gender: 'kids',
    label: 'Kids',
    featuredImage: MEDIA_ASSETS.prodKidsCasual,
    groups: [
      {
        heading: 'Boys & Girls',
        items: [
          { label: 'Denim & Jackets', slug: 'jackets' },
          { label: 'Organic Tees', slug: 't-shirts' },
          { label: 'Dresses & Sets', slug: 'dresses' },
          { label: 'Joggers & Shorts', slug: 'joggers' },
        ],
      },
    ],
  },
  {
    gender: 'footwear',
    label: 'Footwear',
    featuredImage: MEDIA_ASSETS.prodFootwearSneakers,
    groups: [
      {
        heading: 'Styles',
        items: [
          { label: 'Court Sneakers', slug: 'sneakers' },
          { label: 'Running & Training', slug: 'running-shoes' },
          { label: 'Loafers & Boots', slug: 'loafers' },
          { label: 'Heels & Flats', slug: 'heels' },
        ],
      },
    ],
  },
  {
    gender: 'accessories',
    label: 'Accessories',
    featuredImage: MEDIA_ASSETS.prodAccessoriesWatch,
    groups: [
      {
        heading: 'Essentials',
        items: [
          { label: 'Chronograph Watches', slug: 'watches' },
          { label: 'Crossbody & Totes', slug: 'bags' },
          { label: 'Sunglasses & Belts', slug: 'sunglasses' },
        ],
      },
    ],
  },
  {
    gender: 'beauty',
    label: 'Beauty',
    featuredImage: MEDIA_ASSETS.prodBeautySkincare,
    groups: [
      {
        heading: 'Skincare & Makeup',
        items: [
          { label: 'Serums & Elixirs', slug: 'skincare' },
          { label: 'Velvet Lipsticks', slug: 'makeup' },
          { label: 'Fine Fragrances', slug: 'fragrance' },
        ],
      },
    ],
  },
];

export const HOME_CATEGORIES: CategoryTile[] = [
  {
    id: 'cat-1',
    label: 'Men Shirts',
    gender: 'men',
    categorySlug: 'shirts',
    image: MEDIA_ASSETS.prodMensShirt,
    offerText: '40-60% OFF',
  },
  {
    id: 'cat-2',
    label: 'Women Dresses',
    gender: 'women',
    categorySlug: 'dresses',
    image: MEDIA_ASSETS.prodWomensDress,
    offerText: 'UP TO 50% OFF',
  },
  {
    id: 'cat-3',
    label: 'Ethnic Sets',
    gender: 'women',
    categorySlug: 'kurta-sets',
    image: MEDIA_ASSETS.prodWomensEthnic,
    offerText: 'FESTIVE EDIT',
  },
  {
    id: 'cat-4',
    label: 'Work Blazers',
    gender: 'women',
    categorySlug: 'blazers',
    image: MEDIA_ASSETS.prodWomensBlazer,
    offerText: 'MIN 35% OFF',
  },
  {
    id: 'cat-5',
    label: 'Men Jackets',
    gender: 'men',
    categorySlug: 'jackets',
    image: MEDIA_ASSETS.prodMensJacket,
    offerText: 'NEW DROPS',
  },
  {
    id: 'cat-6',
    label: 'Court Sneakers',
    gender: 'footwear',
    categorySlug: 'sneakers',
    image: MEDIA_ASSETS.prodFootwearSneakers,
    offerText: 'FLAT 30% OFF',
  },
  {
    id: 'cat-7',
    label: 'Watches & Bags',
    gender: 'accessories',
    categorySlug: 'watches',
    image: MEDIA_ASSETS.prodAccessoriesWatch,
    offerText: 'LUXE PICKS',
  },
  {
    id: 'cat-8',
    label: 'Clean Beauty',
    gender: 'beauty',
    categorySlug: 'skincare',
    image: MEDIA_ASSETS.prodBeautySkincare,
    offerText: 'GIFT INSIDE',
  },
  {
    id: 'cat-9',
    label: 'Kids Studio',
    gender: 'kids',
    categorySlug: 'all',
    image: MEDIA_ASSETS.prodKidsCasual,
    offerText: 'FROM ₹599',
  },
];
