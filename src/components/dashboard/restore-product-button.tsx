"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreProduct } from "@/lib/actions";
import { RotateCcw, CheckCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

interface RestoreProductButtonProps {
  productId: string;
}

export function RestoreProductButton({ productId }: RestoreProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    setLoading(true);
    setError(null);

    try {
      await restoreProduct(productId);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error("Error restoring product:", err);
      let errorMessage = err.message || "Failed to restore product. Please try again.";

      if (errorMessage.includes("__TURBOPACK__")) {
        errorMessage = errorMessage.split("→").pop()?.trim() || errorMessage;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" />
        Restore
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
          setSuccess(false);
        }}
        title={success ? "Restored!" : error ? "Error" : "Restore Product"}
        description={
          success
            ? "Product has been restored and is now visible to customers again."
            : error
              ? error
              : "This will make the product visible on your store again. Customers will be able to see and purchase it."
        }
        children={
          success ? (
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          ) : null
        }
        actions={
          success
            ? []
            : error
              ? [
                  {
                    label: "Close",
                    onClick: () => {
                      setIsOpen(false);
                      setError(null);
                    },
                    variant: "secondary",
                  },
                ]
              : [
                  {
                    label: "Cancel",
                    onClick: () => setIsOpen(false),
                    variant: "secondary",
                  },
                  {
                    label: "Restore Product",
                    onClick: handleRestore,
                    variant: "primary",
                    loading,
                  },
                ]
        }
      />
    </>
  );
}
