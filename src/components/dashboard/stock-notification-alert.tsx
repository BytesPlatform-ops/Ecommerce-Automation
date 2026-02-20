"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, RefreshCw, TrendingDown, Package, Check } from "lucide-react";
import { motion } from "framer-motion";

interface AffectedItem {
  productId: string;
  productName: string;
  currentStock: number;
  variantInfo?: string;
}

interface Notification {
  id: string;
  type: string;
  affectedItems: AffectedItem[];
  createdAt: string;
  updatedAt: string;
}

export function StockNotificationAlert() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [quantityUpdates, setQuantityUpdates] = useState<Record<string, number>>({});
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Delay the first fetch slightly so it doesn't compete with
    // the initial page hydration / other client-side requests.
    const initialTimeout = setTimeout(fetchNotifications, 1500);
    // Poll for notifications every 60 seconds (reduced from 30s to
    // avoid unnecessary load on the remote database).
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/get-active");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setDismissedIds((prev) => new Set([...prev, notificationId]));
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Failed to dismiss notification", error);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchNotifications();
  };

  const handleUpdateStock = async (
    productId: string,
    variantInfo: string | undefined,
    currentStock: number
  ) => {
    const key = `${productId}-${variantInfo || 'base'}`;
    const addedStock = quantityUpdates[key];

    if (addedStock === undefined || addedStock === null) return;

    setUpdatingItems((prev) => new Set([...prev, key]));
    setErrorMessage(null);

    try {
      // Calculate new total stock by adding the input value to current stock
      const newTotalStock = currentStock + addedStock;
      
      console.log("Updating stock for:", { productId, currentStock, addedStock, newTotalStock, variantInfo });
      const response = await fetch("/api/products/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          newStock: newTotalStock,
          variantInfo,
        }),
      });

      const data = await response.json();
      console.log("API Response:", { status: response.status, data });

      if (response.ok) {
        // Update the notification to reflect new stock
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            affectedItems: notification.affectedItems.map((item) =>
              `${item.productId}-${item.variantInfo || 'base'}` === key
                ? { ...item, currentStock: newTotalStock }
                : item
            ),
          }))
        );
        // Clear the input
        setQuantityUpdates((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      } else {
        const errorMsg = data.error || "Failed to update stock";
        const details = data.details ? ` - ${data.details}` : "";
        const fullError = errorMsg + details;
        console.error("Failed to update stock:", fullError);
        setErrorMessage(fullError);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Failed to update stock:", error);
      setErrorMessage(errorMsg);
    } finally {
      setUpdatingItems((prev) => {
        const updated = new Set(prev);
        updated.delete(key);
        return updated;
      });
    }
  };

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(
    (n) => !dismissedIds.has(n.id)
  );

  if (isLoading && visibleNotifications.length === 0) {
    return null;
  }

  return (
    <>
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-xs sm:text-sm font-medium flex items-center justify-between gap-2"
        >
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
      {visibleNotifications.map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-orange-200/60 rounded-lg sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg shadow-orange-200/20 hover:shadow-xl hover:shadow-orange-200/30 transition-all duration-300 overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-orange-400/10 to-red-400/5 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 pointer-events-none" />

          <div className="relative flex gap-3 sm:gap-4 flex-col sm:flex-row">
            {/* Icon Container */}
            <div className="flex-shrink-0 flex items-center justify-center sm:block">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg"
              >
                <AlertTriangle className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <TrendingDown className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-red-500" />
                    Low Stock Alert
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(notification.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Product List */}
              <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2">
                {(notification.affectedItems as AffectedItem[]).map((item, idx) => (
                  <motion.div
                    key={`${item.productId}-${item.variantInfo || 'base'}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-white/40 hover:bg-white/90 transition-all group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Package className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-800 font-medium truncate text-xs sm:text-sm">
                        {item.productName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-end sm:self-auto">
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg px-2 py-1 sm:py-1.5 border border-red-200/40">
                        <span className="text-red-700 font-bold text-xs whitespace-nowrap leading-none">
                          {item.currentStock} {item.currentStock === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                      
                      {quantityUpdates[`${item.productId}-${item.variantInfo || 'base'}`] !== undefined ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="number"
                            min="0"
                            value={quantityUpdates[`${item.productId}-${item.variantInfo || 'base'}`] ?? ''}
                            onChange={(e) =>
                              setQuantityUpdates((prev) => ({
                                ...prev,
                                [`${item.productId}-${item.variantInfo || 'base'}`]: e.target.value === '' ? 0 : parseInt(e.target.value),
                              }))
                            }
                            autoFocus
                            className="w-14 sm:w-16 px-1.5 sm:px-2 py-1 sm:py-1.5 border border-orange-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="0"
                          />
                          <button
                            onClick={() =>
                              handleUpdateStock(item.productId, item.variantInfo, item.currentStock)
                            }
                            disabled={updatingItems.has(`${item.productId}-${item.variantInfo || 'base'}`)}
                            className="p-1 sm:p-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                          </button>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() =>
                            setQuantityUpdates((prev) => {
                              const updated = { ...prev };
                              updated[`${item.productId}-${item.variantInfo || 'base'}`] = 0;
                              return updated;
                            })
                          }
                          className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-orange-200/40">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <RefreshCw className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Restock
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              title="Dismiss notification"
            >
              <X className="h-4 sm:h-5 w-4 sm:w-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </>
  );
}
