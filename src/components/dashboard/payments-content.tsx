"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getStripeAccountStatus,
  getStoreOrders,
  getOrderStats,
  disconnectStripeAccount,
} from "@/lib/actions";

interface PaymentsContentProps {
  storeId: string;
  initialStripeStatus: {
    isConnected: boolean;
    status: string;
    connectedAt: string | null;
  };
}

type DateFilter = "7days" | "30days" | "all" | "custom";

interface Order {
  id: string;
  customerEmail: string;
  customerName: string | null;
  total: string;
  currency: string;
  status: string;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: string;
  }>;
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
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("30days");
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);

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

  // Fetch data on mount and when filter changes
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, isConnected]);

  async function loadData() {
    setIsLoading(true);
    try {
      // Load account details
      const accountStatus = await getStripeAccountStatus();
      if (accountStatus) {
        setAccountDetails(accountStatus as unknown as StripeAccountDetails);
        setIsConnected(accountStatus.isConnected);
      }

      // Load stats
      const orderStats = await getOrderStats();
      if (orderStats) {
        setStats(orderStats);
      }

      // Load orders based on filter
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

      const orderList = await getStoreOrders({
        startDate,
        limit: 50,
      });
      setOrders(orderList as unknown as Order[]);
      
      // Calculate analytics
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

  function handleConnect() {
    // Redirect to Stripe Connect OAuth - build URL client-side
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const redirectUri = `${baseUrl}/api/payments/connect/callback`;
    const clientId = process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID || "";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      redirect_uri: redirectUri,
      state: storeId,
    });

    window.location.href = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
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
      <div className="bg-linear-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-xl ${isConnected ? "bg-green-100/80" : "bg-gray-100"}`}
            >
              <CreditCard
                className={`h-6 w-6 ${isConnected ? "text-green-600" : "text-gray-400"}`}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
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

          <div className="flex items-center gap-2">
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
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-green-50 to-green-100/50 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total Revenue
              </p>
              <div className="p-3 bg-green-200/50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-gray-600 mt-2">All-time revenue</p>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total Orders
              </p>
              <div className="p-3 bg-blue-200/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
            <p className="text-xs text-gray-600 mt-2">Completed transactions</p>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Last 7 Days
              </p>
              <div className="p-3 bg-purple-200/50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.last7DaysOrders}
            </p>
            <p className="text-xs text-gray-600 mt-2">Orders in past week</p>
          </div>

          <div className="bg-linear-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Last 30 Days
              </p>
              <div className="p-3 bg-indigo-200/50 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.last30DaysOrders}
            </p>
            <p className="text-xs text-gray-600 mt-2">Orders in past month</p>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {isConnected && orders.length > 0 && (
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
                <h3 className="text-lg font-bold text-gray-900">Revenue Timeline</h3>
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
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-linear-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
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
                <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-white to-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage your customer orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="all">All time</option>
            </select>
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
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-500" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              Loading transactions...
            </p>
          </div>
        ) : orders.length === 0 ? (
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
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-gray-100 px-3 py-1.5 rounded text-gray-700">
                        {order.id.slice(0, 8)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.customerName || "Guest Customer"}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.total, order.currency)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Failed"
                              ? "bg-red-100 text-red-800"
                              : order.status === "Refunded"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
