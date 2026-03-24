"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { importProductsFromCsv } from "@/lib/actions";

interface CsvImportButtonProps {
  storeId: string;
}

export function CsvImportButton({ storeId }: CsvImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    details?: string[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Two-phase open: mount first, then trigger CSS transition on next tick
  const openModal = () => {
    setIsOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = () => {
    if (loading) return;
    setVisible(false);
    // Wait for fade-out transition to finish before unmounting
    setTimeout(() => {
      setIsOpen(false);
      setResult(null);
    }, 200);
  };

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, loading]);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setResult({ type: "error", message: "Please upload a .csv file" });
      return;
    }

    if (file.size > 1024 * 1024) {
      setResult({ type: "error", message: "File too large (max 1MB)" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const res = await importProductsFromCsv(storeId, text);

      if ("error" in res && res.error === "PRODUCT_LIMIT_REACHED") {
        setResult({
          type: "error",
          message: "Product limit reached. Upgrade to import more products.",
        });
      } else if ("success" in res && res.success) {
        const parts = [`${res.imported} product${res.imported !== 1 ? "s" : ""} imported`];
        if (res.skipped > 0) parts.push(`${res.skipped} skipped (limit reached)`);
        setResult({
          type: "success",
          message: parts.join(". "),
          details: res.errors.length > 0 ? res.errors : undefined,
        });
        router.refresh();
      }
    } catch (err: any) {
      setResult({
        type: "error",
        message: err.message || "Import failed",
      });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const csv = "name,price,description,stock,category\nClassic T-Shirt,29.99,Comfortable cotton tee,50,Clothing\nCoffee Mug,14.99,12oz ceramic mug,100,Accessories\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
      >
        <Upload className="h-4 w-4" />
        Import CSV
      </button>

      {isOpen && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 200ms ease",
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? "auto" : "none",
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={closeModal}
          />
          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            style={{
              transition: "transform 200ms ease",
              transform: visible ? "scale(1)" : "scale(0.95)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Import Products</h2>
                <p className="text-sm text-gray-500 mt-0.5">Upload a CSV file to bulk-add products</p>
              </div>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Template download */}
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="h-9 w-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                  <Download className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Download template</p>
                  <p className="text-xs text-gray-500">CSV with example rows and correct headers</p>
                </div>
              </button>

              {/* Upload area */}
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${loading ? "border-gray-200 bg-gray-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}>
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <p className="text-sm font-medium text-gray-600">Importing products...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">Click to upload CSV</p>
                      <p className="text-xs text-gray-400">Required columns: name, price</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  disabled={loading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>

              {/* Result */}
              {result && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
                    result.type === "success"
                      ? "bg-emerald-50 border border-emerald-100"
                      : "bg-red-50 border border-red-100"
                  }`}
                >
                  {result.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold ${result.type === "success" ? "text-emerald-800" : "text-red-800"}`}>
                      {result.message}
                    </p>
                    {result.details && result.details.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        {result.details.slice(0, 5).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                        {result.details.length > 5 && (
                          <li>...and {result.details.length - 5} more issues</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Format hint */}
              <div className="text-xs text-gray-400 space-y-1">
                <p><strong className="text-gray-500">Columns:</strong> name, price, description, stock, category</p>
                <p>Category names are matched to your existing categories. Unmatched ones are skipped.</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
