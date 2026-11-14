import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLoyaltyTier,
  calculatePointsForOrder,
  calculatePriceBreakup,
  checkPincodeServiceability,
  filterAndSortProducts,
  validateCoupon,
  validateLuhnCardNumber,
  validateUpiId,
} from './commerce';
import type { Coupon, Product, ProductFilters } from '../types';

const sampleProducts: Product[] = [
  {
    id: 'p1',
    sku: 'SK-1',
    title: 'Olive Linen Shirt',
    subtitle: 'Slim fit breathable shirt',
    brand: 'AURELIA STUDIO',
    gender: 'men',
    category: 'shirts',
    subcategory: 'casual-shirts',
    mrp: 2499,
    price: 1299,
    discountPercent: 48,
    rating: 4.5,
    ratingCount: 1200,
    images: ['img1.jpg'],
    colors: [{ name: 'Olive', hex: '#556B2F', images: ['img1.jpg'] }],
    sizes: [
      { size: 'M', stock: 5 },
      { size: 'L', stock: 0 },
    ],
    fit: 'Slim',
    fabric: 'Linen',
    description: 'Linen shirt',
    highlights: ['100% Linen'],
    careInstructions: 'Machine wash cold',
    tags: ['linen', 'summer'],
    isTrending: true,
    reviews: [],
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'p2',
    sku: 'SK-2',
    title: 'Coral Midi Dress',
    subtitle: 'Pleated wrap silhouette',
    brand: 'VERVE COUTURE',
    gender: 'women',
    category: 'dresses',
    subcategory: 'midi-dresses',
    mrp: 3999,
    price: 2399,
    discountPercent: 40,
    rating: 4.8,
    ratingCount: 840,
    images: ['img2.jpg'],
    colors: [{ name: 'Coral', hex: '#FF7F50', images: ['img2.jpg'] }],
    sizes: [{ size: 'S', stock: 3 }],
    fit: 'Regular',
    fabric: 'Silk Blend',
    description: 'Wrap dress',
    highlights: ['Flowy pleats'],
    careInstructions: 'Dry clean',
    tags: ['party', 'wedding'],
    isTrending: false,
    reviews: [],
    createdAt: '2026-11-01T00:00:00Z',
  },
];

const style200: Coupon = {
  code: 'STYLE200',
  title: 'Flat ₹200 Off',
  description: 'On orders above ₹1,199',
  type: 'flat',
  value: 200,
  minOrderValue: 1199,
  active: true,
};

const first300: Coupon = {
  code: 'FIRST300',
  title: 'Flat ₹300 Off',
  description: 'First order only above ₹1,499',
  type: 'flat',
  value: 300,
  minOrderValue: 1499,
  firstOrderOnly: true,
  active: true,
};

const freeship: Coupon = {
  code: 'FREESHIP',
  title: 'Free Shipping',
  description: 'Waives shipping fee below ₹999',
  type: 'freeship',
  value: 99,
  minOrderValue: 499,
  active: true,
};

test('calculatePriceBreakup applies coupon and free shipping threshold correctly', () => {
  const breakup = calculatePriceBreakup(
    [{ id: 'c1', productId: 'p1', selectedSize: 'M', selectedColor: 'Olive', quantity: 1 }],
    sampleProducts,
    style200,
    true
  );

  assert.equal(breakup.totalMrp, 2499);
  assert.equal(breakup.subtotal, 1299);
  assert.equal(breakup.productDiscount, 1200);
  assert.equal(breakup.couponDiscount, 200);
  assert.equal(breakup.shippingFee, 0); // 1299 >= 999
  assert.equal(breakup.totalPayable, 1099);
  assert.equal(breakup.totalSavings, 1400);
});

test('validateCoupon enforces firstOrderOnly and minOrderValue', () => {
  assert.equal(validateCoupon(first300, 1500, false).valid, false);
  assert.equal(validateCoupon(first300, 1400, true).valid, false);
  assert.equal(validateCoupon(first300, 1500, true).valid, true);
  assert.equal(validateCoupon(freeship, 600, false).valid, true);
});

test('validateLuhnCardNumber and validateUpiId validate payment inputs', () => {
  assert.equal(validateLuhnCardNumber('4111 1111 1111 1111'), true);
  assert.equal(validateLuhnCardNumber('4111 1111 1111 1112'), false);
  assert.equal(validateUpiId('aarav.sharma@okicici'), true);
  assert.equal(validateUpiId('invalid-upi'), false);
});

test('checkPincodeServiceability checks valid and unserviceable pincodes', () => {
  const blr = checkPincodeServiceability('560001');
  assert.equal(blr.serviceable, true);
  assert.equal(blr.codAvailable, true);

  const bad = checkPincodeServiceability('123');
  assert.equal(bad.serviceable, false);

  const remote = checkPincodeServiceability('900001');
  assert.equal(remote.serviceable, false);
});

test('filterAndSortProducts filters by gender, size stock, and sorts by price', () => {
  const baseFilters: ProductFilters = {
    gender: 'men',
    brands: [],
    priceRange: [0, 10000],
    colors: [],
    sizes: ['M'],
    minDiscount: 0,
    minRating: 0,
    fits: [],
    fabrics: [],
    sortBy: 'price_asc',
  };

  const res = filterAndSortProducts(sampleProducts, baseFilters);
  assert.equal(res.length, 1);
  assert.equal(res[0].id, 'p1');

  // Size L has stock 0 so filtering by L should exclude p1
  const outOfStockRes = filterAndSortProducts(sampleProducts, {
    ...baseFilters,
    sizes: ['L'],
  });
  assert.equal(outOfStockRes.length, 0);
});

test('loyalty tier and points calculations work accurately', () => {
  assert.equal(calculateLoyaltyTier(400).tier, 'Insider');
  assert.equal(calculateLoyaltyTier(1200).tier, 'Select');
  assert.equal(calculateLoyaltyTier(2600).tier, 'Runway Icon');
  assert.equal(calculatePointsForOrder(2000), 100);
});
