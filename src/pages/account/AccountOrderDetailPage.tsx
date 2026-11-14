import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useCatalogStore } from '../../store/useCatalogStore';
import { useToastStore } from '../../store/useToastStore';
import { orderService } from '../../services/orderService';
import { formatINR } from '../../utils/commerce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { OrderStatus } from '../../types';
import { SafeImage } from '../../components/common/SafeImage';
import { Modal } from '../../components/common/Modal';

const TIMELINE_STEPS: OrderStatus[] = [
  'Placed',
  'Packed',
  'Shipped',
  'Out for delivery',
  'Delivered',
];

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = useCatalogStore((s) => s.orders.find((o) => o.id === id));
  const showToast = useToastStore((s) => s.showToast);

  useDocumentTitle(order ? `Order ${order.id}` : 'Order Details');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnType, setReturnType] = useState<'Return' | 'Exchange'>('Exchange');
  const [returnReason, setReturnReason] = useState('Size fit issue');
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  if (!order) {
    return (
      <div className="p-8 border border-[#EAEAEC] rounded bg-white text-center space-y-3">
        <p className="text-base font-bold text-[#282C3F]">Order not found</p>
        <Link to="/account/orders" className="text-xs font-bold text-[#FF3F6C] hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);
  const canCancel = order.status === 'Placed' || order.status === 'Packed';
  const canReturn = order.status === 'Delivered' || order.status === 'Out for delivery';

  const handleCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    orderService.updateStatus(order.id, 'Cancelled', {
      cancellationReason: cancelReason,
    });
    setCancelOpen(false);
    showToast(`Order ${order.id} cancelled`, 'info');
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    orderService.updateStatus(order.id, 'Return Requested', {
      returnType,
      returnReason,
    });
    setReturnOpen(false);
    showToast(`${returnType} request submitted for ${order.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/account/orders"
            className="text-xs font-bold text-[#FF3F6C] hover:underline"
          >
            &larr; All Orders
          </Link>
          <h2 className="text-lg font-bold text-[#282C3F] mt-1 font-mono-tabular">
            Order #{order.id}
          </h2>
          <p className="text-xs text-[#535766]">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}{' '}
            · Expected delivery: {order.estimatedDelivery}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 no-print">
          <button
            type="button"
            onClick={() => setInvoiceOpen(true)}
            className="h-9 px-3.5 rounded border border-[#EAEAEC] bg-white text-xs font-bold text-[#282C3F] hover:border-[#282C3F] flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Invoice
          </button>
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="h-9 px-3.5 rounded border border-[#ba1a1a]/40 text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              type="button"
              onClick={() => setReturnOpen(true)}
              className="h-9 px-3.5 rounded border border-[#FF3F6C] text-xs font-bold text-[#FF3F6C] hover:bg-[#FFF0F4] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Return / Exchange
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Status Timeline */}
      <div className="p-5 border border-[#EAEAEC] rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
            Shipment Status
          </span>
          <span
            className={`text-xs font-bold uppercase ${
              order.status === 'Cancelled'
                ? 'text-[#ba1a1a]'
                : order.status === 'Return Requested'
                  ? 'text-[#FF905A]'
                  : 'text-[#14958F]'
            }`}
          >
            {order.status}
          </span>
        </div>

        {order.status === 'Cancelled' ? (
          <p className="text-xs text-[#ba1a1a] bg-[#ffdad6]/50 p-3 rounded">
            Order was cancelled. Reason: {order.cancellationReason || 'Customer requested'}
          </p>
        ) : order.status === 'Return Requested' ? (
          <p className="text-xs text-[#994211] bg-[#ffdbcc]/50 p-3 rounded">
            {order.returnType || 'Return'} requested. Reason: {order.returnReason || 'Requested by shopper'}. Pickup scheduled within 48 hours.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {TIMELINE_STEPS.map((st, idx) => {
              const reached = currentStepIdx >= idx;
              return (
                <div key={st} className="flex flex-col items-center text-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      reached
                        ? 'bg-[#14958F] text-white'
                        : 'bg-[#F5F5F6] text-[#94969F]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold leading-tight ${
                      reached ? 'text-[#282C3F]' : 'text-[#94969F]'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items & Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 border border-[#EAEAEC] rounded-lg bg-white divide-y divide-[#EAEAEC]">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="p-4 flex gap-3.5">
              <SafeImage
                src={item.image}
                alt={item.title}
                className="w-16 h-20 object-cover rounded border border-[#EAEAEC] shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-bold uppercase text-[#282C3F]">{item.brand}</p>
                <Link
                  to={`/product/${item.productId}`}
                  className="font-medium text-[#535766] hover:text-[#FF3F6C] block truncate"
                >
                  {item.title}
                </Link>
                <p className="text-[11px] text-[#94969F] mt-1">
                  Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                </p>
                <p className="font-bold text-[#282C3F] mt-1 tabular-nums">
                  {formatINR(item.unitPrice * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-5 space-y-4 text-xs">
          <div className="p-4 border border-[#EAEAEC] rounded-lg bg-white space-y-1">
            <p className="font-bold uppercase tracking-wider text-[#535766]">
              Delivery Address
            </p>
            <p className="font-bold text-[#282C3F]">{order.address.fullName}</p>
            <p className="text-[#535766]">
              {order.address.houseLine}, {order.address.locality},{' '}
              {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
            <p className="text-[#535766]">Phone: {order.address.phone}</p>
          </div>

          <div className="p-4 border border-[#EAEAEC] rounded-lg bg-white space-y-2 tabular-nums">
            <p className="font-bold uppercase tracking-wider text-[#535766]">
              Price Breakup ({order.paymentMethod})
            </p>
            <div className="flex justify-between">
              <span className="text-[#535766]">Total MRP</span>
              <span>{formatINR(order.priceBreakup.totalMrp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#535766]">Discount</span>
              <span className="text-[#14958F]">
                -{formatINR(order.priceBreakup.productDiscount)}
              </span>
            </div>
            {order.priceBreakup.couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#535766]">Coupon</span>
                <span className="text-[#14958F]">
                  -{formatINR(order.priceBreakup.couponDiscount)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-[#EAEAEC] flex justify-between font-extrabold text-sm text-[#282C3F]">
              <span>Total Paid</span>
              <span>{formatINR(order.priceBreakup.totalPayable)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Order"
      >
        <form onSubmit={handleCancelOrder} className="space-y-4 text-xs">
          <p className="text-[#535766]">
            Select a reason for cancelling order {order.id}:
          </p>
          <select
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
          >
            <option>Ordered by mistake</option>
            <option>Found a better price elsewhere</option>
            <option>Need to change delivery address or size</option>
            <option>Expected delivery time is too long</option>
          </select>
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#ba1a1a] text-white font-bold uppercase tracking-wider cursor-pointer"
          >
            Confirm Cancellation
          </button>
        </form>
      </Modal>

      {/* Return / Exchange Modal */}
      <Modal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Return or Exchange Request"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
          <div className="flex gap-2">
            {(['Exchange', 'Return'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setReturnType(t)}
                className={`flex-1 h-10 rounded border font-bold cursor-pointer ${
                  returnType === t
                    ? 'border-[#FF3F6C] bg-[#FFF0F4] text-[#FF3F6C]'
                    : 'border-[#EAEAEC] text-[#535766]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
          >
            <option>Size fit issue</option>
            <option>Color or fabric different from expectation</option>
            <option>Received damaged or defective piece</option>
            <option>No longer needed</option>
          </select>
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#FF3F6C] text-white font-bold uppercase tracking-wider cursor-pointer"
          >
            Submit {returnType} Request
          </button>
        </form>
      </Modal>

      {/* Printable Invoice Modal */}
      <Modal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title={`Tax Invoice — ${order.id}`}
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-start border-b border-[#EAEAEC] pb-3">
            <div>
              <p className="text-base font-extrabold text-[#282C3F]">StyleKart Retail Pvt. Ltd.</p>
              <p className="text-[#535766]">GSTIN: 29AABCS1429B1Z5 · Bengaluru, KA</p>
            </div>
            <div className="text-right">
              <p className="font-mono-tabular font-bold">{order.id}</p>
              <p className="text-[#535766]">Date: {order.createdAt.slice(0, 10)}</p>
            </div>
          </div>
          <div>
            <p className="font-bold text-[#282C3F]">Billed To:</p>
            <p className="text-[#535766]">
              {order.address.fullName}, {order.address.houseLine}, {order.address.city},{' '}
              {order.address.state} - {order.address.pincode}
            </p>
          </div>
          <table className="w-full border-collapse tabular-nums">
            <thead>
              <tr className="border-y border-[#EAEAEC] bg-[#F5F5F6]">
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEC]">
              {order.items.map((item) => (
                <tr key={`${item.productId}-${item.size}`}>
                  <td className="p-2">
                    {item.brand} — {item.title} ({item.size})
                  </td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right font-semibold">
                    {formatINR(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-[#EAEAEC] tabular-nums">
            <span>Grand Total (Incl. GST)</span>
            <span>{formatINR(order.priceBreakup.totalPayable)}</span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full h-10 rounded-lg bg-[#282C3F] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 no-print cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </Modal>
    </div>
  );
}
