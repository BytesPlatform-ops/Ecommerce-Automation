"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/actions";
import { Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

interface DeleteProductButtonProps {
  productId: string;
  onSuccess?: (productId: string) => void;
}

export function DeleteProductButton({ productId, onSuccess }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteProduct(productId);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        if (onSuccess) {
          onSuccess(productId);
        } else {
          router.refresh();
        }
      }, 1500);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      // Extract clean error message
      let errorMessage = err.message || "Failed to delete product. Please try again.";
      
      // Remove Turbopack wrapper text if present
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
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
          setSuccess(false);
        }}
        title={success ? "Success" : error ? "Error" : "Delete Product"}
        description={
          success
            ? "Product has been removed from your store. It will no longer be visible to customers. You can restore it anytime from your products page."
            : error
              ? error
              : "This will remove the product from your store so customers can no longer see or purchase it. Your order history will be preserved. You can restore it later if needed."
        }
        children={
          success && (
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          )
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
                    label: "Delete",
                    onClick: handleDelete,
                    variant: "danger",
                    loading,
                  },
                ]
        }
      />
    </>
  );
}
