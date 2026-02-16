"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "danger" | "secondary";
    loading?: boolean;
  }[];
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getButtonStyles = (variant: string = "secondary") => {
    const baseStyles =
      "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    switch (variant) {
      case "primary":
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
      case "danger":
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700`;
      case "secondary":
      default:
        return `${baseStyles} bg-gray-200 text-gray-800 hover:bg-gray-300`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap break-words">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {children && <div className="px-6 py-4">{children}</div>}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.loading}
                className={getButtonStyles(action.variant)}
              >
                {action.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  action.label
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
