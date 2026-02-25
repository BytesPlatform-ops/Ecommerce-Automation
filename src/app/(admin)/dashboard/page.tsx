import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getOwnerStore } from "@/lib/admin-cache";
import { getSubscriptionStatus } from "@/lib/actions";
import Link from "next/link";
import {
  Package, Palette, Eye, Plus, TrendingUp,
  ArrowUpRight, DollarSign, ShoppingCart, BarChart3,
  Users, Zap, Activity, ArrowUp, ArrowDown,
  CreditCard, Settings
} from "lucide-react";
import { StockNotificationAlert } from "@/components/dashboard/stock-notification-alert";
import { SubscriptionGate } from "@/components/dashboard/subscription-gate";
import { OrderStatus } from "@prisma/client";

export default async function DashboardPage() {
  // Deduplicated via React cache() — shared with layout.tsx
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Deduplicated via React cache() — shared with layout.tsx
  const store = await getOwnerStore(user.id);

  if (!store) {
    redirect("/onboarding");
  }

  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Fire ALL queries at the same time instead of using $transaction
  // (transactions serialize queries over the network — disastrous with
  // a remote DB like Supabase where each round-trip is ~500ms).
  const [
    productCount,
    lowStockCount,
    totalOrders,
    completedOrders,
    last7DaysOrders,
    last30DaysOrders,
    prev30DaysOrders,
    revenueAggregate,
    prev30Revenue,
    recentOrders,
    recentOrdersForChart,
  ] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id, deletedAt: null } }),
    prisma.product.count({ where: { storeId: store.id, deletedAt: null, stock: { lte: 10 } } }),
    prisma.order.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id, status: OrderStatus.Completed } }),
    prisma.order.count({ where: { storeId: store.id, createdAt: { gte: last7Days } } }),
    prisma.order.count({ where: { storeId: store.id, createdAt: { gte: last30Days } } }),
    prisma.order.count({ where: { storeId: store.id, createdAt: { gte: last60Days, lt: last30Days } } }),
    prisma.order.aggregate({ where: { storeId: store.id, status: OrderStatus.Completed }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { storeId: store.id, status: OrderStatus.Completed, createdAt: { gte: last60Days, lt: last30Days } }, _sum: { total: true } }),
    prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, customerName: true, customerEmail: true,
        total: true, status: true, createdAt: true,
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: last7Days } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalRevenue = Number(revenueAggregate._sum.total) || 0;
  const prevRevenue = Number(prev30Revenue._sum.total) || 0;
  const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0;

  // Calculate trends
  const orderTrend = prev30DaysOrders > 0
    ? ((last30DaysOrders - prev30DaysOrders) / prev30DaysOrders * 100)
    : last30DaysOrders > 0 ? 100 : 0;
  const revenueTrend = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue * 100)
    : totalRevenue > 0 ? 100 : 0;

  // Build 7-day chart data
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      dateStr: d.toISOString().split("T")[0],
    };
  });

  const dailyData = dayLabels.map(({ label, dateStr }) => {
    let dayRevenue = 0;
    let dayOrders = 0;
    recentOrdersForChart.forEach((order) => {
      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
      if (orderDate === dateStr) {
        dayOrders++;
        dayRevenue += Number(order.total) || 0;
      }
    });
    return { label, revenue: dayRevenue, orders: dayOrders };
  });

  const maxDailyRevenue = Math.max(...dailyData.map(d => d.revenue), 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "dash-badge-success";
      case "Pending": return "dash-badge-warning";
      case "Shipped": return "dash-badge-info";
      case "Failed": return "dash-badge-danger";
      case "Refunded": return "dash-badge-neutral";
      default: return "dash-badge-neutral";
    }
  };

  const greeting = (() => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  // Fetch subscription status for the upgrade banner
  const subscriptionStatus = await getSubscriptionStatus(store.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="dash-animate-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
            {greeting}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with{" "}
            <span className="font-semibold text-gray-700">{store.storeName}</span> today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/stores/${store.subdomainSlug}`}
            target="_blank"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
          >
            <Eye className="h-4 w-4" />
            View Store
          </Link>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Subscription Status Banner */}
      <SubscriptionGate subscriptionStatus={subscriptionStatus} />

      {/* Stock Notifications */}
      <StockNotificationAlert />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="dash-stat-card dash-animate-in dash-delay-1" style={{ "--stat-color": "#10b981" } as React.CSSProperties}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 stat-value">
                ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${revenueTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {revenueTrend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(revenueTrend).toFixed(1)}% vs prev period
              </div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="dash-stat-card dash-animate-in dash-delay-2" style={{ "--stat-color": "#3b82f6" } as React.CSSProperties}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 stat-value">{totalOrders}</p>
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${orderTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {orderTrend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(orderTrend).toFixed(1)}% vs prev period
              </div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="dash-stat-card dash-animate-in dash-delay-3" style={{ "--stat-color": "#8b5cf6" } as React.CSSProperties}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 stat-value">{productCount}</p>
              {lowStockCount > 0 ? (
                <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
                  ⚠️ {lowStockCount} low stock
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> All stocked
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="dash-stat-card dash-animate-in dash-delay-4" style={{ "--stat-color": "#f59e0b" } as React.CSSProperties}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Order</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 stat-value">
                ${avgOrderValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-2 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {completionRate.toFixed(0)}% completion rate
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (7-day) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm dash-animate-in dash-delay-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="dash-section-title">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Revenue Overview
              </h2>
              <p className="text-sm text-gray-500 mt-1">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-500 to-indigo-500" />
                <span className="text-gray-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border-2 border-emerald-500" />
                <span className="text-gray-500">Orders</span>
              </div>
            </div>
          </div>

          {totalOrders > 0 ? (
            <div className="space-y-3">
              {dailyData.map((day, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 w-10">{day.label}</span>
                  <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden flex items-center relative">
                    <div
                      className="dash-chart-bar dash-bar-revenue h-full"
                      style={{
                        width: `${maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 100 : 0}%`,
                        animationDelay: `${i * 0.08}s`,
                        minWidth: day.revenue > 0 ? '8px' : '0px',
                      }}
                    />
                    {day.revenue > 0 && (
                      <span className="absolute right-2 text-xs font-semibold text-gray-600">
                        ${day.revenue.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 w-16 justify-end">
                    <ShoppingCart className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-medium text-gray-600">{day.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty-state py-12">
              <div className="icon-container">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-gray-500 text-sm">Revenue data will appear here once you receive orders</p>
            </div>
          )}
        </div>

        {/* Insights Sidebar */}
        <div className="space-y-5 dash-animate-in dash-delay-6">
          {/* Store Health */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Store Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payments</span>
                {store.stripeConnectId ? (
                  <span className="dash-badge dash-badge-success">
                    <span className="dash-live-dot bg-emerald-500" /> Connected
                  </span>
                ) : (
                  <Link href="/dashboard/payments" className="dash-badge dash-badge-warning hover:opacity-80 transition-opacity">
                    Setup Required
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Theme</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: store.theme?.primaryHex || '#3b82f6' }} />
                  <span className="text-sm font-medium text-gray-900">{store.theme?.name || "Default"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Products</span>
                <span className={`dash-badge ${productCount > 0 ? 'dash-badge-success' : 'dash-badge-warning'}`}>
                  {productCount} listed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Domain</span>
                {store.domain ? (
                  <span className="dash-badge dash-badge-success">{store.domain}</span>
                ) : (
                  <Link href="/dashboard/settings" className="dash-badge dash-badge-neutral hover:opacity-80 transition-opacity">
                    Not set
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* This Week Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              This Week
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{last7DaysOrders}</p>
                <p className="text-xs text-gray-500 mt-0.5">Orders</p>
              </div>
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  ${dailyData.reduce((s, d) => s + d.revenue, 0).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm dash-animate-in dash-delay-7">
          <h2 className="dash-section-title mb-5">
            <Zap className="h-5 w-5 text-amber-500" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link href="/dashboard/products/new" className="dash-quick-action bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-50 hover:to-indigo-50 group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Add New Product</p>
                  <p className="text-xs text-gray-500">Create a new product listing</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link href="/dashboard/themes" className="dash-quick-action bg-gradient-to-r from-purple-50/80 to-pink-50/80 hover:from-purple-50 hover:to-pink-50 group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Change Theme</p>
                  <p className="text-xs text-gray-500">Customize your store look</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </Link>
            <Link href="/dashboard/payments" className="dash-quick-action bg-gradient-to-r from-emerald-50/80 to-teal-50/80 hover:from-emerald-50 hover:to-teal-50 group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Manage Payments</p>
                  <p className="text-xs text-gray-500">View orders & revenue</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
            <Link href="/dashboard/settings" className="dash-quick-action bg-gradient-to-r from-gray-50/80 to-slate-50/80 hover:from-gray-50 hover:to-slate-50 group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md shadow-gray-500/20">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Store Settings</p>
                  <p className="text-xs text-gray-500">Configure your store details</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm dash-animate-in dash-delay-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="dash-section-title">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Recent Orders
            </h2>
            <Link href="/dashboard/payments" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all group cursor-default">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {order.customerName || order.customerEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items · {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`dash-badge ${getStatusColor(order.status)}`}>{order.status}</span>
                    <span className="text-sm font-bold text-gray-900">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty-state py-8">
              <div className="icon-container">
                <ShoppingCart className="h-7 w-7 text-blue-500" />
              </div>
              <p className="text-gray-500 text-sm">No orders yet</p>
              <p className="text-gray-400 text-xs mt-1">Orders will appear here when customers make purchases</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
