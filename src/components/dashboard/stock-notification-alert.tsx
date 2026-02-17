"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";

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

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(
    (n) => !dismissedIds.has(n.id)
  );

  if (isLoading && visibleNotifications.length === 0) {
    return null;
  }

  return (
    <>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-400 rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Low Stock Alert
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                The following products are running low on stock:
              </p>

              {/* Product List */}
              <div className="space-y-2 mb-3">
                {(notification.affectedItems as AffectedItem[]).map((item) => (
                  <div
                    key={`${item.productId}-${item.variantInfo || 'base'}`}
                    className="flex items-center justify-between bg-white/60 rounded-md px-3 py-2 text-sm"
                  >
                    <span className="text-gray-700 font-medium">
                      {item.productName}
                    </span>
                    <span className="ml-2 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex-shrink-0">
                      {item.currentStock} {item.currentStock === 1 ? 'unit' : 'units'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Last updated info */}
              <p className="text-xs text-gray-600 mb-3">
                Last updated: {new Date(notification.updatedAt).toLocaleString()}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              title="Dismiss notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
