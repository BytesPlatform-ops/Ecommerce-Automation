"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  CreditCard,
  AlertCircle,
  ExternalLink,
  Loader2,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getStripeAccountStatus,
  getStoreOrders,
  getOrderStats,
  disconnectStripeAccount,
  getStripePendingCharges,
} from "@/lib/actions";
import { OrderDetailsModal } from "./order-details-modal";

interface PaymentsContentProps {
  storeId: string;
  initialStripeStatus: {
    isConnected: boolean;
    status: string;
    connectedAt: string | null;
  };
}

type DateFilter = "7days" | "30days" | "all" | "custom";
type StatusFilter = "all" | "Pending" | "Completed" | "Shipped" | "Failed" | "Refunded";

interface Order {
  id: string;
  customerEmail: string;
  customerName: string | null;
  total: string;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    variantInfo?: string;
  }>;
  // Shipping information
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
  // Tracking information
  trackingNumber?: string | null;
  shippedAt?: Date | null;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: string;
  last7DaysOrders: number;
  last30DaysOrders: number;
}

interface StripeAccountDetails {
  storeId: string;
  isConnected: boolean;
  status: string;
  connectedAt?: string;
  account?: {
    id: string;
    email: string | null;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  } | null;
  balance?: {
    available: Array<{ amount: number; currency: string }>;
    pending: Array<{ amount: number; currency: string }>;
  } | null;
  recentPayouts?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    arrivalDate: string;
  }>;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export default function PaymentsContent({
  storeId,
  initialStripeStatus,
}: PaymentsContentProps) {
  const [isConnected, setIsConnected] = useState(
    initialStripeStatus.isConnected,
  );
  const [accountDetails, setAccountDetails] =
    useState<StripeAccountDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingCharges, setPendingCharges] = useState<any[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("30days");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPendingCharges, setIsLoadingPendingCharges] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for URL params (success/error from OAuth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setIsConnected(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("error")) {
      setError(params.get("error"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Debounced filter changes - wait 500ms after filter change before fetching
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on filter change
      loadData();
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, statusFilter]);

  // Initial data load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // Lazy load pending charges after main data loads
  useEffect(() => {
    if (accountDetails?.isConnected && accountDetails?.account?.id && !isLoading) {
      setIsLoadingPendingCharges(true);
      getStripePendingCharges(accountDetails.account.id, 50)
        .then(charges => setPendingCharges(charges || []))
        .catch(err => console.error("Failed to load pending charges:", err))
        .finally(() => setIsLoadingPendingCharges(false));
    }
  }, [accountDetails?.isConnected, accountDetails?.account?.id, isLoading]);

  async function loadData() {
    setIsLoading(true);
    try {
      // Determine date filter
      let startDate: Date | undefined;
      const now = new Date();

      switch (dateFilter) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startDate = undefined;
      }

      // Load core data in parallel (faster initial load - only fetch what's needed)
      const [accountStatus, orderStats, orderList] = await Promise.all([
        getStripeAccountStatus(),
        getOrderStats(),
        getStoreOrders({
          startDate,
          limit: 50, // Core data load
        }),
      ]);

      // Update account details (don't fetch pending charges here - lazy load them)
      if (accountStatus) {
        setAccountDetails(accountStatus as unknown as StripeAccountDetails);
        setIsConnected(accountStatus.isConnected);
      }

      // Update stats
      if (orderStats) {
        setStats(orderStats);
      }

      // Update orders and analytics
      setOrders(orderList as unknown as Order[]);
      calculateAnalytics(orderList as unknown as Order[]);
    } catch (err) {
      console.error("Error loading payment data:", err);
      setError("Failed to load payment data");
    } finally {
      setIsLoading(false);
    }
  }

  function calculateAnalytics(orderList: Order[]) {
    // Group orders by date
    const revenueByDate: Record<string, { revenue: number; orders: number }> = {};
    
    orderList.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      
      if (!revenueByDate[date]) {
        revenueByDate[date] = { revenue: 0, orders: 0 };
      }
      
      revenueByDate[date].revenue += parseFloat(order.total);
      revenueByDate[date].orders += 1;
    });
    
    // Convert to array and sort by date
    const sortedData = Object.entries(revenueByDate)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => {
        const dateA = new Date(`${a.date} 2026`);
        const dateB = new Date(`${b.date} 2026`);
        return dateA.getTime() - dateB.getTime();
      });
    
    setDailyRevenue(sortedData);
  }

  async function handleDisconnect() {
    if (
      !confirm(
        "Are you sure you want to disconnect your Stripe account? You won't be able to receive payments until you reconnect.",
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const result = await disconnectStripeAccount(storeId);
      if (result.success) {
        setIsConnected(false);
        setAccountDetails(null);
      } else {
        setError(result.error || "Failed to disconnect");
      }
    } catch (err) {
      console.error("Error disconnecting:", err);
      setError("Failed to disconnect Stripe account");
    } finally {
      setIsDisconnecting(false);
    }
  }

  async function handleConnect() {
    // Request signed OAuth URL from server to prevent CSRF
    try {
      setError(null);
      const response = await fetch("/api/payments/connect/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to initiate Stripe Connect");
        return;
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("Error initiating Stripe Connect:", err);
      setError("Failed to initiate Stripe Connect");
    }
  }

  function formatCurrency(amount: number | string, currency = "usd") {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(numAmount);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Analytics helper functions
  function getAverageOrderValue(): number {
    if (orders.length === 0) return 0;
    const total = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    return total / orders.length;
  }

  function getConversionMetrics() {
    const completedOrders = orders.filter((o) => o.status === "Completed").length;
    const conversionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;
    return {
      completedOrders,
      conversionRate: conversionRate.toFixed(1),
    };
  }

  function getTopProducts() {
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productMap[item.productName].quantity += item.quantity;
        productMap[item.productName].revenue += item.quantity * parseFloat(item.unitPrice);
      });
    });
    
    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  function getMaxRevenue(): number {
    return Math.max(...dailyRevenue.map((d) => d.revenue), 0);
  }

  function getPendingPaymentMetrics() {
    const pendingOrders = orders.filter((o) => o.status === "Pending");
    const totalPending = pendingOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    return {
      count: pendingOrders.length,
      total: totalPending,
    };
  }

  function getFilteredOrders(): Order[] {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesStatus;
    });
  }

  // Memoize expensive calculations to avoid recalculating on every render
  const displayTransactions = useMemo(() => {
    // Convert pending charges to display format
    const pendingTransactions = pendingCharges.map((charge: any) => ({
      id: charge.id,
      customerEmail: charge.billing_details?.email || charge.metadata?.email || "Guest",
      customerName: charge.billing_details?.name || charge.metadata?.customer_name || "Guest Customer",
      total: (charge.amount / 100).toString(),
      currency: charge.currency,
      status: "Processing",
      createdAt: new Date(charge.created * 1000),
      items: [
        {
          id: "",
          productName: "Payment (in processing)",
          quantity: 1,
          unitPrice: (charge.amount / 100).toString(),
        }
      ],
      isPending: true,
    }));

    // Apply status filter to pending transactions
    const filteredPendingTransactions = pendingTransactions.filter((transaction: any) => {
      return statusFilter === "all" || transaction.status === statusFilter;
    });

    // Combine with actual orders (which are already filtered by getFilteredOrders)
    const allTransactions = [...filteredPendingTransactions, ...getFilteredOrders()];
    
    // Apply search filter
    const filtered = allTransactions.filter((transaction: any) => {
      const query = searchQuery.toLowerCase();
      const customerMatch =
        transaction.customerEmail.toLowerCase().includes(query) ||
        transaction.customerName.toLowerCase().includes(query);
      const orderIdMatch = transaction.id.toLowerCase().includes(query);
      const statusMatch = transaction.status.toLowerCase().includes(query);
      const amountMatch = transaction.total.toString().includes(query);
      const productMatch = transaction.items.some((item: any) =>
        item.productName.toLowerCase().includes(query)
      );
      
      return customerMatch || orderIdMatch || statusMatch || amountMatch || productMatch;
    });
    
    // Sort by date
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, pendingCharges, searchQuery, statusFilter]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayTransactions.slice(startIndex, endIndex);
  }, [displayTransactions, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(displayTransactions.length / itemsPerPage);
  }, [displayTransactions.length, itemsPerPage]);

  const orderStatusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      shipped: orders.filter((o) => o.status === "Shipped").length,
      failed: orders.filter((o) => o.status === "Failed").length,
      refunded: orders.filter((o) => o.status === "Refunded").length,
    };
  }, [orders]);

  // Optimistic update for a single order (when shipped)
  function updateOrderOptimistically(orderId: string, updatedData: Partial<Order>) {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, ...updatedData } : order
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700 underline mt-1 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stripe Connection Status - Enhanced Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all dash-animate-in dash-delay-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-xl shrink-0 ${isConnected ? "bg-green-100/80" : "bg-gray-100"}`}
            >
              <CreditCard
                className={`h-6 w-6 ${isConnected ? "text-green-600" : "text-gray-400"}`}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                Stripe Account
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {isConnected ? (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      Connected
                    </span>
                    {accountDetails?.account?.email && (
                      <span className="text-sm text-gray-600 ml-2">
                        {accountDetails.account.email}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-amber-700">
                      Not connected
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isConnected ? (
              <>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDisconnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Disconnect"
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
              >
                <CreditCard className="h-4 w-4" />
                Connect Stripe
              </button>
            )}
          </div>
        </div>

        {/* Account Status Details */}
        {isConnected && accountDetails?.account && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  Charges
                </p>
                <p
                  className={`text-lg font-bold mt-2 ${accountDetails.account.chargesEnabled ? "text-green-600" : "text-red-600"}`}
                >
                  {accountDetails.account.chargesEnabled
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  Payouts
                </p>
                <p
                  className={`text-lg font-bold mt-2 ${accountDetails.account.payoutsEnabled ? "text-green-600" : "text-red-600"}`}
                >
                  {accountDetails.account.payoutsEnabled
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
              {accountDetails.balance && (
                <>
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                      Available
                    </p>
                    <p className="text-lg font-bold mt-2 text-green-700">
                      {accountDetails.balance.available.length > 0
                        ? formatCurrency(
                            accountDetails.balance.available[0].amount / 100,
                            accountDetails.balance.available[0].currency,
                          )
                        : "$0.00"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                        Processing
                      </p>
                      <div className="group relative">
                        <AlertCircle className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
                          Recent transactions being processed (typically 1-2
                          days)
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-bold mt-2 text-amber-600">
                      {accountDetails.balance.pending.length > 0
                        ? formatCurrency(
                            accountDetails.balance.pending[0].amount / 100,
                            accountDetails.balance.pending[0].currency,
                          )
                        : "$0.00"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Not Connected Message */}
        {!isConnected && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-5">
              <h3 className="font-bold text-amber-900">
                Connect your Stripe account to start receiving payments
              </h3>
              <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                You need to connect a Stripe account to accept payments from
                customers. Stripe will handle all payment processing, and funds
                will be deposited directly to your bank account.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pending Payments Analytics */}
      {isConnected && orders.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pending Count */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 bg-amber-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-700" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  Pending Orders
                </p>
              </div>
              <p className="text-3xl font-bold text-amber-900">
                {getPendingPaymentMetrics().count}
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Awaiting customer payment
              </p>
            </div>

            {/* Pending Total */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 bg-orange-200 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-700" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  Pending Amount
                </p>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {formatCurrency(getPendingPaymentMetrics().total)}
              </p>
              <p className="text-xs text-orange-700 mt-2">
                Total pending revenue
              </p>
            </div>

            {/* Processing/In-Transit from Stripe */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 bg-blue-200 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-700" />
                </div>
                <div className="group relative">
                  <p className="text-sm font-semibold uppercase tracking-wide cursor-help" style={{ color: 'var(--primary)' }}>
                    Processing
                  </p>
                  <div className="hidden group-hover:block absolute left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    Payments in transit (1-2 days)
                  </div>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {accountDetails?.balance?.pending && accountDetails.balance.pending.length > 0
                  ? formatCurrency(accountDetails.balance.pending[0].amount / 100, accountDetails.balance.pending[0].currency)
                  : "$0.00"}
              </p>
              <p className="text-xs text-blue-700 mt-2">
                In Stripe account
              </p>
            </div>

            {/* Status Summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 bg-green-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-700" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  Order Status
                </p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Completed:</span>
                  <span className="font-semibold text-green-700">{orderStatusCounts.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Failed:</span>
                  <span className="font-semibold text-red-700">{orderStatusCounts.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Refunded:</span>
                  <span className="font-semibold text-gray-700">{orderStatusCounts.refunded}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Stats Cards - Loading or Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="dash-stat-card" style={{ "--stat-color": "#10b981" } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Total Revenue
              </p>
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                <DollarSign className="h-5 w-5 text-emerald-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">All-time revenue</p>
          </div>

          <div className="dash-stat-card" style={{ "--stat-color": "#3b82f6" } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Total Orders
              </p>
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <TrendingUp className="h-5 w-5 text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
            <p className="text-xs text-gray-500 mt-2">Completed transactions</p>
          </div>

          <div className="dash-stat-card" style={{ "--stat-color": "#8b5cf6" } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Last 7 Days
              </p>
              <div className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                <Calendar className="h-5 w-5 text-purple-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.last7DaysOrders}
            </p>
            <p className="text-xs text-gray-500 mt-2">Orders in past week</p>
          </div>

          <div className="dash-stat-card" style={{ "--stat-color": "#6366f1" } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Last 30 Days
              </p>
              <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                <Calendar className="h-5 w-5 text-indigo-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.last30DaysOrders}
            </p>
            <p className="text-xs text-gray-500 mt-2">Orders in past month</p>
          </div>
        </div>
      ) : null}

      {/* Analytics Section - Loading or Content */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Skeleton */}
            <div className="space-y-4">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            {/* Metrics Skeleton */}
            <div className="space-y-6">
              <div>
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-100 rounded animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isConnected && orders.length > 0 && (
        <div className="space-y-4">
          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Order Value */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Avg. Order Value
                </p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getAverageOrderValue())}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Average per transaction
              </p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Success Rate
                </p>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {getConversionMetrics().conversionRate}%
                </p>
                <p className="text-xs text-gray-600">
                  ({getConversionMetrics().completedOrders}/{orders.length})
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-2">Completed transactions</p>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Peak Day Revenue
                </p>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getMaxRevenue())}
              </p>
              <p className="text-xs text-gray-600 mt-2">Highest daily earnings</p>
            </div>
          </div>

          {/* Revenue Chart */}
          {dailyRevenue.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Revenue Timeline</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Daily revenue across selected period
                </p>
              </div>

              <div className="space-y-4">
                {dailyRevenue.map((day, index) => {
                  const maxRev = getMaxRevenue();
                  const percentage = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium text-gray-700 w-16">
                            {day.date}
                          </span>
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="dash-chart-bar dash-bar-revenue h-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(day.revenue)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {day.orders} order{day.orders !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Products */}
          {getTopProducts().length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Top Products</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Best performing products by revenue
                </p>
              </div>

              <div className="space-y-4">
                {getTopProducts().map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {index + 1}. {product.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.quantity} unit{product.quantity !== 1 ? "s" : ""} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(
                          (product.revenue /
                            orders.reduce((sum, o) => sum + parseFloat(o.total), 0)) *
                          100
                        ).toFixed(1)}
                        % of revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Transactions</h2>
              <p className="text-sm text-gray-600 mt-1">
                View and manage your customer orders
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh orders"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-600 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:min-w-[200px] sm:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Shipped">Shipped</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <>
            {/* Mobile loading skeleton */}
            <div className="sm:hidden divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-40 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            {/* Desktop loading skeleton */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="space-y-2"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div><div className="h-3 w-40 bg-gray-100 rounded animate-pulse"></div></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : displayTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              No transactions yet
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Orders will appear here when customers make purchases
            </p>
          </div>
        ) : (
          <>
            {/* Mobile card view - only visible on small screens */}
            <div className="block sm:hidden divide-y divide-gray-200">
              {paginatedTransactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  onClick={() => {
                    setSelectedOrder(transaction);
                    setIsModalOpen(true);
                  }}
                  className={`p-4 cursor-pointer active:bg-gray-100 transition-colors ${
                    transaction.isPending ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {transaction.customerName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {transaction.customerEmail}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                      {formatCurrency(transaction.total, transaction.currency)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : transaction.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "Shipped"
                            ? "bg-purple-100 text-purple-800"
                            : transaction.status === "Failed"
                            ? "bg-red-100 text-red-800"
                            : transaction.status === "Refunded"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.isPending ? (
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-current rounded-full animate-pulse"></span>
                            {transaction.status}
                          </span>
                        ) : (
                          transaction.status
                        )}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.paymentStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : transaction.paymentStatus === "Paid"
                            ? "bg-blue-100 text-blue-800"
                            : transaction.paymentStatus === "Settled"
                            ? "bg-green-100 text-green-800"
                            : transaction.paymentStatus === "Refunded"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600 font-medium mb-1">Products:</p>
                    <div className="flex flex-wrap gap-2">
                      {transaction.items.map((item: any) => (
                        <span key={item.id} className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1">
                          {item.productName} {item.quantity > 1 && `(×${item.quantity})`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      #{transaction.id.slice(0, 8)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table view - only visible on sm and above */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((transaction: any, index) => (
                  <tr
                    key={transaction.id}
                    onClick={() => {
                      setSelectedOrder(transaction);
                      setIsModalOpen(true);
                    }}
                    className={`hover:bg-gray-100 cursor-pointer transition-colors ${
                      transaction.isPending ? "bg-blue-50/30" : index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-gray-100 px-3 py-1.5 rounded text-gray-700">
                        {transaction.id.slice(0, 8)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {transaction.customerName}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {transaction.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {transaction.items.length} item
                        {transaction.items.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(transaction.total, transaction.currency)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                          transaction.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : transaction.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "Shipped"
                              ? "bg-purple-100 text-purple-800"
                              : transaction.status === "Failed"
                                ? "bg-red-100 text-red-800"
                                : transaction.status === "Refunded"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.isPending ? (
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-current rounded-full animate-pulse"></span>
                            {transaction.status}
                          </span>
                        ) : (
                          transaction.status
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                          transaction.paymentStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : transaction.paymentStatus === "Paid"
                            ? "bg-blue-100 text-blue-800"
                            : transaction.paymentStatus === "Settled"
                            ? "bg-green-100 text-green-800"
                            : transaction.paymentStatus === "Refunded"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {!isLoading && displayTransactions.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, displayTransactions.length)} of {displayTransactions.length} transactions
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1">
                {/* Mobile: just show current/total */}
                <span className="sm:hidden text-sm text-gray-600 px-2">
                  {currentPage} / {totalPages}
                </span>
                {/* Desktop: show page buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-blue-500 text-white font-semibold"
                              : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          onOrderShipped={(updatedOrder) => {
            // Optimistically update the order in the table immediately
            const updatedOrderData = {
              status: "Shipped" as const,
              trackingNumber: updatedOrder?.trackingNumber,
              shippedAt: updatedOrder?.shippedAt ? new Date(updatedOrder.shippedAt) : null,
            };
            updateOrderOptimistically(selectedOrder.id, updatedOrderData);
            // Also update the modal's selected order with fresh data
            setSelectedOrder((prev) => prev ? { ...prev, ...updatedOrderData } : null);
            // Optimistic updates ensure the table and modal stay in sync instantly
          }}
        />
      )}
    </div>
  );
}
