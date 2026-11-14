import { Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck, Truck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#F5F5F6] border-t border-[#EAEAEC] pt-12 pb-24 md:pb-12 text-[#535766] no-print">
      <div className="sk-container px-4 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-[#EAEAEC]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-[#282C3F] mb-4">
              Online Shopping
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/men/all" className="hover:text-[#282C3F]">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/women/all" className="hover:text-[#282C3F]">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/kids/all" className="hover:text-[#282C3F]">
                  Kids
                </Link>
              </li>
              <li>
                <Link to="/footwear/all" className="hover:text-[#282C3F]">
                  Footwear
                </Link>
              </li>
              <li>
                <Link to="/accessories/all" className="hover:text-[#282C3F]">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/beauty/all" className="hover:text-[#282C3F]">
                  Beauty
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-[#282C3F] mb-4">
              Customer Policies
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/account/orders" className="hover:text-[#282C3F]">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-[#282C3F]">
                  14-Day Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link to="/account/rewards" className="hover:text-[#282C3F]">
                  Coupons &amp; Loyalty Tiers
                </Link>
              </li>
              <li>
                <Link to="/bag" className="hover:text-[#282C3F]">
                  Shipping Above ₹999 Free
                </Link>
              </li>
              <li>
                <Link to="/search?visual=1" className="hover:text-[#282C3F]">
                  AI Visual Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-[#282C3F] mb-4">
              Quick Access
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/wishlist" className="hover:text-[#282C3F]">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#282C3F]">
                  Account Overview
                </Link>
              </li>
              <li>
                <Link to="/account/addresses" className="hover:text-[#282C3F]">
                  Saved Addresses
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#282C3F]">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#14958F] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs leading-relaxed">
                <strong className="text-[#282C3F]">100% Original</strong> guarantee for all products at StyleKart.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#14958F] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs leading-relaxed">
                <strong className="text-[#282C3F]">Return within 14 days</strong> of receiving your order.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#14958F] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs leading-relaxed">
                <strong className="text-[#282C3F]">Free express delivery</strong> on orders above ₹999.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94969F]">
          <p>&copy; 2026 StyleKart Retail Pvt. Ltd. All rights reserved.</p>
          <p>Original Fashion &amp; Lifestyle Storefront</p>
        </div>
      </div>
    </footer>
  );
}
