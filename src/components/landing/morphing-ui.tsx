"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SectionWrapper } from "./section-wrapper";
import { 
  Store, 
  Database, 
  LayoutDashboard, 
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Settings,
  CreditCard,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

type TabKey = "storefront" | "database" | "dashboard";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "storefront", label: "Storefront", icon: Store },
  { key: "database", label: "Database Schema", icon: Database },
  { key: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
];

/* Storefront Mockup */
function StorefrontView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A3D2B]/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4873A]" />
          <span className="font-bold text-[#1A3D2B]">STREETWEAR</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-6 text-sm text-[#8FA898]">
            <span>Shop</span>
            <span>Collections</span>
            <span>About</span>
          </div>
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-[#8FA898]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4873A] text-[10px] text-white flex items-center justify-center">
              3
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="p-6 bg-[#1A3D2B] text-white">
        <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-2">New Collection</p>
        <h3 className="text-2xl font-black mb-2">URBAN ELITE</h3>
        <p className="text-sm text-[#8FA898] mb-4">Limited edition streetwear</p>
        <button className="px-4 py-2 bg-[#D4873A] text-white text-sm font-semibold rounded-lg">
          Shop Now
        </button>
      </div>

      {/* Products Grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {[
          { name: "Oversized Hoodie", price: "$89", image: "https://images.unsplash.com/photo-1611312449545-94176309c857?q=80&w=656&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=1000&h=1000&fit=crop" },
          { name: "Cargo Pants", price: "$120", image: "https://images.unsplash.com/photo-1639736922209-793b59a41572?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=1000&h=1000&fit=crop" },
          // { name: "Graphic Tee", price: "$45", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
          // { name: "Track Jacket", price: "$135", image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=400&fit=crop" },
        ].map((product, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-video rounded-xl bg-gray-100 mb-1.5 relative overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-[#D4873A]/20 flex items-center justify-center"
              >
                <span className="px-3 py-1 bg-[#F5F0E8] rounded-full text-xs font-medium shadow-lg">
                  Quick View
                </span>
              </motion.div>
            </div>
            <p className="text-sm font-medium text-[#1A3D2B]">{product.name}</p>
            <p className="text-sm text-[#D4873A] font-semibold">{product.price}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* Database Schema Mockup */
function DatabaseView() {
  const tables = [
    { 
      name: "products", 
      color: "violet",
      fields: ["id", "name", "price", "description", "stock", "created_at"]
    },
    { 
      name: "orders", 
      color: "blue",
      fields: ["id", "customer_id", "status", "total", "created_at"]
    },
    { 
      name: "customers", 
      color: "emerald",
      fields: ["id", "email", "name", "stripe_id", "created_at"]
    },
    { 
      name: "variants", 
      color: "amber",
      fields: ["id", "product_id", "size", "color", "sku"]
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="h-full p-4 bg-[#1A3D2B] overflow-hidden"
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-mono text-[#8FA898] ml-2">PostgreSQL — bytescart_db</span>
      </div>

      {/* Schema visualization */}
      <div className="grid grid-cols-2 gap-3">
        {tables.map((table, i) => (
          <motion.div
            key={table.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-lg border ${
              table.color === "violet" ? "border-[#D4873A]/30 bg-[#D4873A]/10" :
              table.color === "blue" ? "border-[#C9A84C]/30 bg-[#C9A84C]/10" :
              table.color === "emerald" ? "border-emerald-500/30 bg-emerald-500/10" :
              "border-[#C9A84C]/30 bg-[#C9A84C]/10"
            } overflow-hidden`}
          >
            <div className={`px-3 py-2 ${
              table.color === "violet" ? "bg-[#D4873A]/20 text-[#D4873A]" :
              table.color === "blue" ? "bg-[#C9A84C]/20 text-[#C9A84C]" :
              table.color === "emerald" ? "bg-emerald-500/20 text-emerald-400" :
              "bg-[#C9A84C]/20 text-[#C9A84C]"
            } text-xs font-mono font-bold flex items-center gap-2`}>
              <Database className="w-3 h-3" />
              {table.name}
            </div>
            <div className="p-2 space-y-1">
              {table.fields.map((field, j) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + j * 0.05 }}
                  className="flex items-center gap-2 text-[10px] font-mono text-[#8FA898]"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    field === "id" ? "bg-[#C9A84C]" : "bg-[#8FA898]"
                  }`} />
                  <span>{field}</span>
                  {field === "id" && <span className="text-[#C9A84C] text-[8px]">PK</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection lines animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center"
      >
        <span className="text-[10px] font-mono text-[#8FA898]">
          ✓ Auto-generated migrations • ✓ Type-safe queries • ✓ Real-time sync
        </span>
      </motion.div>
    </motion.div>
  );
}

/* Admin Dashboard Mockup */
function DashboardView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      {/* Sidebar */}
      <div className="flex h-full">
        <div className="w-14 bg-[#0D2B1F] p-3 flex flex-col gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4873A]" />
          <div className="flex-1 flex flex-col gap-2 mt-4">
            {[LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings].map((Icon, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  i === 0 ? "bg-[#D4873A]/20 text-[#D4873A]" : "text-[#8FA898] hover:text-[#F5F0E8]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-[#F5F0E8] p-4 overflow-hidden">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Revenue", value: "$12,429", change: "+23%", icon: CreditCard },
              { label: "Orders", value: "156", change: "+8%", icon: ShoppingCart },
              { label: "Customers", value: "1,203", change: "+12%", icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-xl bg-white border border-[#2E5C40]/10 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-4 h-4 text-[#8FA898]" />
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-lg font-bold text-[#1A3D2B]">{stat.value}</p>
                <p className="text-[10px] text-[#8FA898]">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-xl border border-[#2E5C40]/10 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2E5C40]/10 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A3D2B]">Recent Orders</span>
              <span className="text-xs text-[#D4873A] flex items-center gap-1 cursor-pointer hover:underline">
                View all <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <div className="divide-y divide-[#2E5C40]/5">
              {[
                { id: "#4521", customer: "John D.", amount: "$89.00", status: "Shipped" },
                { id: "#4520", customer: "Sarah M.", amount: "$245.00", status: "Processing" },
                { id: "#4519", customer: "Mike R.", amount: "$156.00", status: "Delivered" },
              ].map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="px-4 py-2.5 flex max-md:flex-col max-md:gap-2 items-center justify-between gap-3"
                >
                  <div className="flex max-md:flex-col max-md:gap-1 items-center gap-3">
                    <span className="text-xs font-mono text-[#8FA898]">{order.id}</span>
                    <span className="text-sm text-[#1A3D2B]">{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#1A3D2B]">{order.amount}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      order.status === "Shipped" ? "bg-[#2E5C40]/10 text-[#2E5C40]" :
                      order.status === "Processing" ? "bg-[#C9A84C]/20 text-[#C9A84C]" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MorphingUI() {
  const [activeTab, setActiveTab] = useState<TabKey>("storefront");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex((t) => t.key === current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].key;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <SectionWrapper id="demo" className="py-16 sm:py-24">
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs text-[#D4873A] uppercase tracking-[0.2em] mb-4 font-semibold"
        >
          Full Stack AI
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A3D2B] tracking-tight mb-5"
        >
          Manage everything{" "}
          <span className="bg-gradient-to-r from-[#D4873A] to-[#C9A84C] bg-clip-text text-transparent">
            visually
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#8FA898] max-w-2xl mx-auto text-base sm:text-lg"
        >
          Drag, customize, and control your entire store from one intuitive dashboard
        </motion.p>
      </div>

      {/* Tab buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setIsAutoPlaying(false);
            }}
            className={`group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#D4873A] text-white shadow-lg shadow-[#D4873A]/30"
                : "bg-white/60 backdrop-blur-sm text-[#1A3D2B] border border-[#2E5C40]/20 hover:border-[#D4873A]/40 hover:text-[#D4873A]"
            }`}
          >
            <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mockup container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative rounded-3xl border border-[#2E5C40]/20 bg-[#F5F0E8]/90 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-[#2E5C40]/10">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#2E5C40]/10 bg-[#F5F0E8]/60">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-[#C9A84C]/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 mx-4">
              <div className="h-8 rounded-lg bg-[#1A3D2B]/10 flex items-center px-4 gap-2">
                <span className="text-xs text-[#8FA898] font-mono">
                  {activeTab === "storefront" && "https://your-store.bytescart.dev"}
                  {activeTab === "database" && "postgresql://bytescart_db"}
                  {activeTab === "dashboard" && "https://your-store.bytescart.dev/admin"}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="h-[500px] overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "storefront" && <StorefrontView key="storefront" />}
              {activeTab === "database" && <DatabaseView key="database" />}
              {activeTab === "dashboard" && <DashboardView key="dashboard" />}
            </AnimatePresence>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -inset-12 bg-gradient-to-br from-[#2E5C40]/20 via-[#D4873A]/10 to-[#122E22]/20 rounded-[48px] blur-3xl -z-10 pointer-events-none" />
      </motion.div>

      {/* Auto-play indicator */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="flex items-center gap-2 text-sm text-[#8FA898] hover:text-[#D4873A] transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? "bg-emerald-500 animate-pulse" : "bg-[#8FA898]"}`} />
          {isAutoPlaying ? "Auto-playing" : "Paused"} · Click tabs to explore
        </button>
      </div>
    </SectionWrapper>
  );
}
