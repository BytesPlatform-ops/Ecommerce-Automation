"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreTestimonial } from "@/types/database";
import {
  createStoreTestimonial,
  updateStoreTestimonial,
  deleteStoreTestimonial,
  reorderStoreTestimonials,
} from "@/lib/actions";
import {
  CheckCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface TestimonialsSettingsProps {
  storeId: string;
  testimonials: StoreTestimonial[];
}

function sortTestimonials(items: StoreTestimonial[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function TestimonialsSettings({
  storeId,
  testimonials,
}: TestimonialsSettingsProps) {
  const [items, setItems] = useState<StoreTestimonial[]>(() =>
    sortTestimonials(testimonials)
  );
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!newCustomerName.trim() || !newContent.trim()) {
      setError("Customer name and testimonial are required");
      return;
    }

    setLoadingAdd(true);

    try {
      const created = await createStoreTestimonial(storeId, {
        customerName: newCustomerName.trim(),
        content: newContent.trim(),
      });

      setItems((prev) => sortTestimonials([...prev, created]));
      setNewCustomerName("");
      setNewContent("");
      setSuccess("Testimonial added successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add testimonial"
      );
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSave = async (testimonialId: string) => {
    setError(null);
    setSuccess(null);
    setSavingId(testimonialId);

    const testimonial = items.find((item) => item.id === testimonialId);

    if (!testimonial) {
      setError("Testimonial not found");
      setSavingId(null);
      return;
    }

    if (!testimonial.customerName.trim() || !testimonial.content.trim()) {
      setError("Customer name and testimonial are required");
      setSavingId(null);
      return;
    }

    try {
      const updated = await updateStoreTestimonial(testimonialId, {
        customerName: testimonial.customerName.trim(),
        content: testimonial.content.trim(),
        isPublished: testimonial.isPublished,
      });

      setItems((prev) =>
        sortTestimonials(
          prev.map((item) => (item.id === testimonialId ? updated : item))
        )
      );
      setSuccess("Testimonial updated successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update testimonial"
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (testimonialId: string) => {
    const confirmed = window.confirm("Delete this testimonial?");

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteStoreTestimonial(testimonialId);
      setItems((prev) => prev.filter((item) => item.id !== testimonialId));
      setSuccess("Testimonial deleted");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete testimonial"
      );
    }
  };

  const handleReorder = async (
    testimonialId: string,
    direction: "up" | "down"
  ) => {
    const ordered = sortTestimonials(items);
    const index = ordered.findIndex((item) => item.id === testimonialId);

    if (index < 0) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= ordered.length) {
      return;
    }

    const updated = [...ordered];
    const temp = updated[index];
    updated[index] = updated[swapIndex];
    updated[swapIndex] = temp;

    const reindexed = updated.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));

    setItems(reindexed);

    try {
      await reorderStoreTestimonials(storeId, reindexed.map((item) => item.id));
      setSuccess("Testimonial order updated");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reorder testimonials"
      );
      router.refresh();
    }
  };

  const handleFieldChange = (
    testimonialId: string,
    field: "customerName" | "content" | "isPublished",
    value: string | boolean
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === testimonialId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      <div
        className="border-l-4 border-gray-200 rounded-xl p-4"
        style={{
          borderLeftColor: "var(--primary)",
          backgroundColor: "rgba(0,0,0,0.01)",
        }}
      >
        <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--primary)" }}>
          Add a new testimonial
        </h3>
        <div className="space-y-3">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--primary)" }}
            >
              Customer Name
            </label>
            <input
              type="text"
              value={newCustomerName}
              onChange={(event) => setNewCustomerName(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Sarah Anderson"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--primary)" }}
            >
              Testimonial
            </label>
            <textarea
              value={newContent}
              onChange={(event) => setNewContent(event.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Share what the customer says about your products..."
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={loadingAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus className="h-4 w-4" />
            {loadingAdd ? "Adding..." : "Add Testimonial"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No testimonials yet. Add your first customer testimonial above.
          </div>
        )}

        {items.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="border-l-4 border-gray-200 rounded-xl p-4 space-y-3"
            style={{ borderLeftColor: "var(--primary)" }}
          >
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--primary)" }}
              >
                Testimonial #{index + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(testimonial.id, "up")}
                  disabled={index === 0}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(testimonial.id, "down")}
                  disabled={index === items.length - 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 rounded-lg border border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--primary)" }}
              >
                Customer Name
              </label>
              <input
                type="text"
                value={testimonial.customerName}
                onChange={(event) =>
                  handleFieldChange(
                    testimonial.id,
                    "customerName",
                    event.target.value
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--primary)" }}
              >
                Testimonial
              </label>
              <textarea
                value={testimonial.content}
                onChange={(event) =>
                  handleFieldChange(
                    testimonial.id,
                    "content",
                    event.target.value
                  )
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={testimonial.isPublished}
                  onChange={(event) =>
                    handleFieldChange(
                      testimonial.id,
                      "isPublished",
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Published
              </label>

              <button
                type="button"
                onClick={() => handleSave(testimonial.id)}
                disabled={savingId === testimonial.id}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {savingId === testimonial.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
