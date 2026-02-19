"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Package, MapPin, User, Mail, Phone, DollarSign, Calendar, Truck, Loader2, CheckCircle, Copy, Check } from "lucide-react";
import { markOrderAsShipped } from "@/lib/actions";

function formatCurrency(amount: number | string, currency = "usd") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(num);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface OrderItem {
  id: string;
  productName: string;
  variantInfo?: string;
  quantity: number;
  unitPrice: string;
}

interface OrderDetailsModalProps {
  order: {
    id: string;
    customerEmail: string;
    customerName: string | null;
    total: string;
    currency: string;
    status: string;
    paymentStatus: string;
    createdAt: Date;
    items: OrderItem[];
    shippingFirstName?: string;
    shippingLastName?: string;
    shippingCompany?: string;
    shippingAddress?: string;
    shippingApartment?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingZipCode?: string;
    shippingCountry?: string;
    shippingPhone?: string;
    trackingNumber?: string | null;
    shippedAt?: Date | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onOrderShipped?: (updatedOrder?: { trackingNumber: string; shippedAt: string }) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOrderShipped,
}: OrderDetailsModalProps) {
  const [isShipping, setIsShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingSuccess, setShippingSuccess] = useState<{ trackingNumber: string } | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Must be above the conditional return — React hooks cannot be called conditionally
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  // All hooks are above — safe to return early now
  if (!isOpen || !mounted) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleMarkAsShipped = async () => {
    setIsShipping(true);
    setShippingError(null);
    
    try {
      const result = await markOrderAsShipped(order.id, trackingInput || undefined);
      
      if (result.success) {
        setShippingSuccess({ trackingNumber: trackingInput });
        onOrderShipped?.({
          trackingNumber: trackingInput,
          shippedAt: result.shippedAt!,
        });
        
        // Close modal after showing success for just a moment
        setTimeout(() => {
          onClose?.();
        }, 1500);
      } else {
        setShippingError(result.message || "Failed to mark as shipped");
      }
    } catch (error) {
      setShippingError("An unexpected error occurred");
    } finally {
      setIsShipping(false);
    }
  };

  const isAlreadyShipped = order.status === "Shipped" || shippingSuccess !== null;
  const displayTrackingNumber = shippingSuccess?.trackingNumber || order.trackingNumber;

  const hasShippingInfo =
    order.shippingAddress ||
    order.shippingCity ||
    order.shippingCountry;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[101] overflow-y-auto flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-2xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] sm:max-h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white px-6 py-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <div className="mt-4 bg-white/15 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-blue-100 uppercase tracking-widest font-semibold mb-2">Order ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-white break-all flex-1">
                    {order.id}
                  </p>
                  <button
                    onClick={copyOrderId}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="Copy order ID"
                    aria-label="Copy order ID"
                  >
                    {copiedOrderId ? (
                      <Check className="h-5 w-5 text-green-300" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                    Order Status
                  </p>
                  <span
                    className={`inline-flex px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap ${
                      order.status === "Processing"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Shipped" || isAlreadyShipped
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "Failed"
                              ? "bg-red-100 text-red-700"
                              : order.status === "Refunded"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isAlreadyShipped ? "Shipped" : order.status}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                    Payment Status
                  </p>
                  <span
                    className={`inline-flex px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap ${
                      order.paymentStatus === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : order.paymentStatus === "Paid"
                          ? "bg-blue-100 text-blue-700"
                          : order.paymentStatus === "Settled"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "Refunded"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                  {order.customerName && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                        Customer Name
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {order.customerName}
                      </p>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                          Email Address
                        </p>
                        <p className="text-base font-medium text-gray-900 break-all">
                          {order.customerEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {hasShippingInfo && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
                    {(order.shippingFirstName || order.shippingLastName) && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                          Recipient
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {order.shippingFirstName} {order.shippingLastName}
                        </p>
                      </div>
                    )}
                    {order.shippingCompany && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                          Company
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {order.shippingCompany}
                        </p>
                      </div>
                    )}
                    {order.shippingAddress && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                          Street Address
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {order.shippingAddress}
                          {order.shippingApartment && `, ${order.shippingApartment}`}
                        </p>
                      </div>
                    )}
                    {(order.shippingCity || order.shippingState || order.shippingZipCode) && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                          City, State, ZIP
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                        </p>
                      </div>
                    )}
                    {order.shippingCountry && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                          Country
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {order.shippingCountry}
                        </p>
                      </div>
                    )}
                    {order.shippingPhone && (
                      <div className="border-t border-gray-200 pt-3 flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                            Phone Number
                          </p>
                          <p className="text-base font-medium text-gray-900">
                            {order.shippingPhone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                  Order Items ({order.items.length})
                </h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                          {item.variantInfo && (
                            <p className="text-xs text-gray-600 mt-1 font-medium">{item.variantInfo}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-base">
                            {formatCurrency(item.unitPrice, order.currency)}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-semibold uppercase">Line Total</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(
                            (parseFloat(item.unitPrice) * item.quantity).toString(),
                            order.currency
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-blue-200 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-base">Total Amount</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Date */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                    Order Placed
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Tracking Input - Show when not yet shipped */}
              {!isAlreadyShipped && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                      Shipping Information
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Enter a tracking number, shipping link, or any tracking information for the customer. This is optional.
                  </p>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g., TRK-123456789 or https://track.example.com/123456"
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              )}

              {/* Tracking Information - Show when shipped */}
              {displayTrackingNumber && (
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-purple-600 uppercase tracking-widest font-bold mb-1">
                      Tracking Information
                    </p>
                    <p className="text-base font-semibold text-gray-900 font-mono">
                      {displayTrackingNumber}
                    </p>
                    {(order.shippedAt || shippingSuccess) && (
                      <p className="text-xs text-purple-500 mt-1">
                        Shipped on {formatDate(order.shippedAt || new Date())}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Marked as Shipped Message - Show when shipped without tracking info */}
              {isAlreadyShipped && !displayTrackingNumber && (
                <div className="bg-green-50 rounded-xl p-5 border border-green-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-green-600 uppercase tracking-widest font-bold mb-1">
                      Shipment Status
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      Order marked as shipped
                    </p>
                    {(order.shippedAt || shippingSuccess) && (
                      <p className="text-xs text-green-600 mt-1">
                        Shipped on {formatDate(order.shippedAt || new Date())}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
            {shippingError && (
              <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {shippingError}
              </div>
            )}
            {shippingSuccess && (
              <div className="mb-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                Order marked as shipped! Closing in a moment...
              </div>
            )}
            <div className="flex gap-3 justify-end">
              {!isAlreadyShipped && (
                <button
                  onClick={handleMarkAsShipped}
                  disabled={isShipping}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  title="Mark order as shipped (tracking info is optional)"
                >
                  {isShipping ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Marking as Shipped...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" />
                      Mark as Shipped
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
