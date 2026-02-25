"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Package, 
  Check, 
  Plus,
  ChevronDown,
  ChevronUp,
  BoxIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LowStockItem {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  imageUrl: string | null;
  variantInfo: string | null;
  type: "product" | "variant";
}

export function StockNotificationAlert() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(0);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLowStockItems = useCallback(async () => {
    try {
      const response = await fetch("/api/products/low-stock");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch low stock items", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimeout = setTimeout(fetchLowStockItems, 800);
    return () => clearTimeout(initialTimeout);
  }, [fetchLowStockItems]);

  const handleRefresh = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    fetchLowStockItems();
  };

  const getItemKey = (item: LowStockItem) => {
    return item.type === "variant" ? `variant-${item.id}` : `product-${item.productId}`;
  };

  const handleStartEdit = (item: LowStockItem) => {
    setEditingKey(getItemKey(item));
    setAddQuantity(0);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setAddQuantity(0);
  };

  const handleUpdateStock = async (item: LowStockItem) => {
    if (addQuantity <= 0) {
      setErrorMessage("Please enter a quantity greater than 0");
      return;
    }

    const key = getItemKey(item);
    setUpdatingKey(key);
    setErrorMessage(null);

    try {
      const newTotalStock = item.currentStock + addQuantity;
      
      const response = await fetch("/api/products/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          newStock: newTotalStock,
          variantInfo: item.variantInfo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state immediately
        setItems((prev) =>
          prev.map((i) =>
            getItemKey(i) === key
              ? { ...i, currentStock: newTotalStock }
              : i
          ).filter((i) => i.currentStock > 10) // Remove items that are now above threshold
        );
        setEditingKey(null);
        setAddQuantity(0);
        setSuccessMessage(`Added ${addQuantity} units to ${item.productName}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(data.error || "Failed to update stock");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setUpdatingKey(null);
    }
  };

  if (isDismissed || (items.length === 0 && !isLoading)) {
    return null;
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-4 mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-amber-200 rounded" />
            <div className="h-3 w-48 bg-amber-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white border border-amber-200 rounded-2xl mb-6 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 cursor-pointer hover:from-amber-100 hover:via-orange-100 hover:to-amber-100 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Low Stock Alert
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                {items.length}
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              {items.length} item{items.length !== 1 ? "s" : ""} with stock ≤ 10 units
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-red-50 border-b border-red-100"
          >
            <p className="text-sm text-red-600 font-medium flex items-center gap-2">
              <X className="h-4 w-4" />
              {errorMessage}
            </p>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-emerald-50 border-b border-emerald-100"
          >
            <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
              <Check className="h-4 w-4" />
              {successMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {items.map((item, idx) => {
                const key = getItemKey(item);
                const isEditing = editingKey === key;
                const isUpdating = updatingKey === key;
                const newTotal = item.currentStock + addQuantity;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`rounded-xl border transition-all ${
                      isEditing 
                        ? "bg-blue-50/50 border-blue-200" 
                        : "bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="p-3">
                      {/* Item Info Row */}
                      <div className="flex items-center gap-3">
                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BoxIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.productName}
                          </p>
                          {item.variantInfo && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Variant: {item.variantInfo}
                            </p>
                          )}
                        </div>

                        {/* Stock Badge & Action */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                            item.currentStock === 0
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : item.currentStock <= 5
                              ? "bg-orange-100 text-orange-700 border border-orange-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}>
                            {item.currentStock}
                          </div>
                          {!isEditing && (
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Edit Form */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-blue-200/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                  Quantity to add
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={addQuantity || ""}
                                  onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
                                  autoFocus
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                  placeholder="Enter quantity..."
                                />
                              </div>
                              {addQuantity > 0 && (
                                <div className="text-center pt-5">
                                  <p className="text-xs text-gray-500">New total</p>
                                  <p className="text-lg font-bold text-emerald-600">{newTotal}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => handleUpdateStock(item)}
                                disabled={isUpdating || addQuantity <= 0}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors"
                              >
                                {isUpdating ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Update Stock
                                  </>
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
