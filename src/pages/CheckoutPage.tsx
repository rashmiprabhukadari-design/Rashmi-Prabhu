import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  CreditCard,
  Landmark,
  MapPin,
  Plus,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { orderService } from '../services/orderService';
import {
  calculatePriceBreakup,
  formatINR,
  validateLuhnCardNumber,
  validateUpiId,
} from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Address, PaymentMethod } from '../types';

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();

  const { items, appliedCouponCode, clearCart } = useCartStore();
  const products = useCatalogStore((s) => s.products);
  const coupons = useCatalogStore((s) => s.coupons);
  const orders = useCatalogStore((s) => s.orders);
  const { addresses, addAddress } = useAuthStore();
  const showToast = useToastStore((s) => s.showToast);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);

  // New Address Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [houseLine, setHouseLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [addrType, setAddrType] = useState<Address['type']>('Home');
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('aarav@okicici');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('PhonePe Wallet');
  const [paymentError, setPaymentError] = useState('');

  const isFirstOrder = orders.length === 0;
  const activeCoupon = appliedCouponCode
    ? coupons.find((c) => c.code === appliedCouponCode) ?? null
    : null;

  const breakup = useMemo(
    () => calculatePriceBreakup(items, products, activeCoupon, isFirstOrder),
    [items, products, activeCoupon, isFirstOrder]
  );

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (items.length === 0) {
    return (
      <div className="sk-container px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#282C3F]">Your Bag is Empty</h1>
        <p className="text-sm text-[#535766]">
          Add items to your bag before checking out.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider"
        >
          Shop Styles
        </Link>
      </div>
    );
  }

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Name is required.';
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      errs.phone = 'Enter a valid 10-digit mobile number.';
    if (!/^[1-9]\d{5}$/.test(pincode.trim()))
      errs.pincode = 'Enter a valid 6-digit pincode.';
    if (!houseLine.trim()) errs.houseLine = 'Address line is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!stateName.trim()) errs.stateName = 'State is required.';

    if (Object.keys(errs).length > 0) {
      setAddrErrors(errs);
      return;
    }
    setAddrErrors({});
    const created = addAddress({
      fullName: fullName.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      houseLine: houseLine.trim(),
      locality: locality.trim() || city.trim(),
      city: city.trim(),
      state: stateName.trim(),
      type: addrType,
      isDefault: true,
    });
    setSelectedAddressId(created.id);
    setShowAddForm(false);
    showToast('Address saved');
  };

  const handleValidatePaymentAndContinue = () => {
    setPaymentError('');
    if (paymentMethod === 'UPI') {
      if (!validateUpiId(upiId)) {
        setPaymentError('Please enter a valid UPI ID (e.g. name@okaxis).');
        return;
      }
    } else if (paymentMethod === 'CARD') {
      if (!validateLuhnCardNumber(cardNumber)) {
        setPaymentError(
          'Card number failed Luhn checksum validation. Try 4111 1111 1111 1111.'
        );
        return;
      }
      if (!cardName.trim()) {
        setPaymentError('Enter name printed on card.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        setPaymentError('Enter expiry in MM/YY format.');
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        setPaymentError('Enter a valid 3 or 4 digit CVV.');
        return;
      }
    }
    setStep(3);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      setStep(1);
      return;
    }
    const order = orderService.placeOrder({
      cartItems: items,
      address: selectedAddress,
      paymentMethod,
      paymentLast4:
        paymentMethod === 'CARD'
          ? cardNumber.replace(/\D/g, '').slice(-4)
          : undefined,
      couponCode: appliedCouponCode,
    });
    clearCart();
    showToast(`Order ${order.id} placed successfully!`);
    navigate(`/order-success/${order.id}`, { replace: true });
  };

  return (
    <div className="sk-container px-4 md:px-10 py-8 pb-20">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 pb-5 border-b border-[#EAEAEC] text-xs font-bold uppercase tracking-wider">
        {[
          { num: 1, label: 'Address' },
          { num: 2, label: 'Payment' },
          { num: 3, label: 'Review' },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              disabled={s.num > step}
              onClick={() => setStep(s.num as 1 | 2 | 3)}
              className={`flex items-center gap-2 cursor-pointer disabled:cursor-default ${
                step === s.num
                  ? 'text-[#FF3F6C]'
                  : step > s.num
                    ? 'text-[#14958F]'
                    : 'text-[#94969F]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                  step === s.num
                    ? 'bg-[#FF3F6C] text-white'
                    : step > s.num
                      ? 'bg-[#14958F] text-white'
                      : 'bg-[#F5F5F6] text-[#94969F]'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </span>
              <span>{s.label}</span>
            </button>
            {idx < 2 && <span className="w-8 sm:w-14 h-[1px] bg-[#EAEAEC]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-[#282C3F]">
                  Select Delivery Address
                </h1>
                <button
                  type="button"
                  onClick={() => setShowAddForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#282C3F] text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:bg-[#282C3F] hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddForm ? 'Cancel' : 'Add New Address'}
                </button>
              </div>

              {showAddForm && (
                <form
                  onSubmit={handleSaveAddress}
                  className="p-5 rounded-lg border border-[#EAEAEC] bg-white space-y-3 text-xs"
                >
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                    New Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
                      />
                      {addrErrors.fullName && (
                        <p className="text-[#ba1a1a] mt-1">{addrErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-Digit Mobile *"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
                      />
                      {addrErrors.phone && (
                        <p className="text-[#ba1a1a] mt-1">{addrErrors.phone}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Pincode *"
                        value={pincode}
                        onChange={(e) =>
                          setPincode(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
                      />
                      {addrErrors.pincode && (
                        <p className="text-[#ba1a1a] mt-1">{addrErrors.pincode}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Locality / Area"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Flat / House No., Building, Street *"
                      value={houseLine}
                      onChange={(e) => setHouseLine(e.target.value)}
                      className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
                    />
                    {addrErrors.houseLine && (
                      <p className="text-[#ba1a1a] mt-1">{addrErrors.houseLine}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="City *"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
                      />
                      {addrErrors.city && (
                        <p className="text-[#ba1a1a] mt-1">{addrErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State *"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
                      />
                      {addrErrors.stateName && (
                        <p className="text-[#ba1a1a] mt-1">{addrErrors.stateName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    {(['Home', 'Work', 'Other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddrType(t)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer ${
                          addrType === t
                            ? 'border-[#FF3F6C] bg-[#FFF0F4] text-[#FF3F6C]'
                            : 'border-[#EAEAEC] text-[#535766]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-[#282C3F] text-white font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => {
                  const active = addr.id === selectedAddressId;
                  return (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                        active
                          ? 'border-[#FF3F6C] bg-[#FFF0F4]/40'
                          : 'border-[#EAEAEC] bg-white hover:border-[#282C3F]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="delivery-address"
                          checked={active}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-[#FF3F6C] w-4 h-4"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#282C3F]">
                              {addr.fullName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#F5F5F6] text-[10px] font-bold uppercase text-[#14958F]">
                              {addr.type}
                            </span>
                          </div>
                          <p className="text-[#535766]">
                            {addr.houseLine}, {addr.locality}, {addr.city},{' '}
                            {addr.state} -{' '}
                            <strong className="text-[#282C3F] tabular-nums">
                              {addr.pincode}
                            </strong>
                          </p>
                          <p className="text-[#535766]">
                            Mobile:{' '}
                            <strong className="text-[#282C3F] tabular-nums">
                              {addr.phone}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!selectedAddress}
                onClick={() => setStep(2)}
                className="w-full sm:w-auto h-12 px-10 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                Continue to Payment
              </button>
            </section>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <section className="space-y-4">
              <h1 className="text-lg font-bold text-[#282C3F]">
                Choose Payment Mode
              </h1>

              <div className="border border-[#EAEAEC] rounded-lg bg-white overflow-hidden divide-y divide-[#EAEAEC]">
                {[
                  {
                    id: 'UPI' as PaymentMethod,
                    label: 'UPI (GPay, PhonePe, Paytm)',
                    icon: Smartphone,
                  },
                  {
                    id: 'CARD' as PaymentMethod,
                    label: 'Credit / Debit Card (Luhn Verified)',
                    icon: CreditCard,
                  },
                  {
                    id: 'NETBANKING' as PaymentMethod,
                    label: 'Net Banking',
                    icon: Landmark,
                  },
                  {
                    id: 'WALLET' as PaymentMethod,
                    label: 'Wallets',
                    icon: Wallet,
                  },
                  {
                    id: 'COD' as PaymentMethod,
                    label: 'Cash on Delivery (Pay at Doorstep)',
                    icon: Truck,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <div key={opt.id} className="p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment-method"
                          checked={active}
                          onChange={() => {
                            setPaymentMethod(opt.id);
                            setPaymentError('');
                          }}
                          className="accent-[#FF3F6C] w-4 h-4"
                        />
                        <Icon className="w-4 h-4 text-[#535766]" />
                        <span className="text-sm font-bold text-[#282C3F]">
                          {opt.label}
                        </span>
                      </label>

                      {active && opt.id === 'UPI' && (
                        <div className="mt-3 pl-7 space-y-2 text-xs">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="Enter UPI ID (e.g. aarav@okicici)"
                            aria-label="UPI ID"
                            className="w-full max-w-sm h-10 px-3 rounded border border-[#EAEAEC] outline-none focus:border-[#282C3F]"
                          />
                        </div>
                      )}

                      {active && opt.id === 'CARD' && (
                        <div className="mt-3 pl-7 space-y-3 text-xs max-w-md">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number (try 4111 1111 1111 1111)"
                            aria-label="Card number"
                            className="w-full h-10 px-3 rounded border border-[#EAEAEC] font-mono-tabular outline-none focus:border-[#282C3F]"
                          />
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name on Card"
                            aria-label="Name on card"
                            className="w-full h-10 px-3 rounded border border-[#EAEAEC] outline-none focus:border-[#282C3F]"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              aria-label="Card expiry"
                              className="h-10 px-3 rounded border border-[#EAEAEC] font-mono-tabular outline-none focus:border-[#282C3F]"
                            />
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) =>
                                setCardCvv(e.target.value.replace(/\D/g, ''))
                              }
                              placeholder="CVV"
                              aria-label="Card CVV"
                              className="h-10 px-3 rounded border border-[#EAEAEC] font-mono-tabular outline-none focus:border-[#282C3F]"
                            />
                          </div>
                        </div>
                      )}

                      {active && opt.id === 'NETBANKING' && (
                        <div className="mt-3 pl-7">
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            aria-label="Select bank"
                            className="h-10 px-3 rounded border border-[#EAEAEC] text-xs font-semibold"
                          >
                            <option>HDFC Bank</option>
                            <option>ICICI Bank</option>
                            <option>State Bank of India</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      )}

                      {active && opt.id === 'WALLET' && (
                        <div className="mt-3 pl-7">
                          <select
                            value={selectedWallet}
                            onChange={(e) => setSelectedWallet(e.target.value)}
                            aria-label="Select wallet"
                            className="h-10 px-3 rounded border border-[#EAEAEC] text-xs font-semibold"
                          >
                            <option>PhonePe Wallet</option>
                            <option>Amazon Pay</option>
                            <option>Paytm Wallet</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {paymentError && (
                <p
                  role="alert"
                  className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded"
                >
                  {paymentError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 px-6 rounded-lg border border-[#EAEAEC] text-xs font-bold uppercase tracking-wider text-[#282C3F] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleValidatePaymentAndContinue}
                  className="h-12 px-8 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Review Order
                </button>
              </div>
            </section>
          )}

          {/* STEP 3: REVIEW & PLACE ORDER */}
          {step === 3 && (
            <section className="space-y-5">
              <h1 className="text-lg font-bold text-[#282C3F]">
                Review &amp; Confirm Order
              </h1>

              {selectedAddress && (
                <div className="p-4 rounded-lg border border-[#EAEAEC] bg-white text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[#535766] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF3F6C]" />
                      Delivering To
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[#FF3F6C] font-bold hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                  <p className="font-bold text-sm text-[#282C3F]">
                    {selectedAddress.fullName} · {selectedAddress.phone}
                  </p>
                  <p className="text-[#535766]">
                    {selectedAddress.houseLine}, {selectedAddress.locality},{' '}
                    {selectedAddress.city}, {selectedAddress.state} -{' '}
                    {selectedAddress.pincode}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg border border-[#EAEAEC] bg-white text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[#535766] block">
                    Payment Method
                  </span>
                  <span className="text-sm font-bold text-[#282C3F]">
                    {paymentMethod}
                    {paymentMethod === 'CARD' && cardNumber
                      ? ` ending in ${cardNumber.replace(/\D/g, '').slice(-4)}`
                      : paymentMethod === 'UPI'
                        ? ` (${upiId})`
                        : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[#FF3F6C] font-bold hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-12 px-6 rounded-lg border border-[#EAEAEC] text-xs font-bold uppercase tracking-wider text-[#282C3F] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="flex-1 sm:flex-initial h-12 px-10 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Pay {formatINR(breakup.totalPayable)} &amp; Place Order
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-4 p-5 border border-[#EAEAEC] rounded bg-white space-y-3 text-xs lg:sticky lg:top-[88px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#535766]">
            Order Summary
          </h2>
          <div className="space-y-2 tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#535766]">Total MRP</span>
              <span>{formatINR(breakup.totalMrp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#535766]">Discount</span>
              <span className="text-[#14958F] font-semibold">
                -{formatINR(breakup.productDiscount)}
              </span>
            </div>
            {breakup.couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#535766]">
                  Coupon ({breakup.couponCode})
                </span>
                <span className="text-[#14958F] font-semibold">
                  -{formatINR(breakup.couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#535766]">Shipping</span>
              <span className="text-[#14958F] font-semibold">
                {breakup.shippingFee === 0
                  ? 'FREE'
                  : formatINR(breakup.shippingFee)}
              </span>
            </div>
            <div className="pt-3 border-t border-[#EAEAEC] flex justify-between text-sm font-extrabold text-[#282C3F]">
              <span>Total Payable</span>
              <span>{formatINR(breakup.totalPayable)}</span>
            </div>
          </div>

          <p className="pt-2 flex items-center gap-1.5 text-[11px] text-[#535766]">
            <ShieldCheck className="w-4 h-4 text-[#14958F] shrink-0" />
            256-bit SSL encrypted simulated checkout
          </p>
        </aside>
      </div>
    </div>
  );
}
