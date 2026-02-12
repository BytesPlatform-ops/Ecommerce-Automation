"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreShippingReturnsSection } from "@/types/database";
import {
  createStoreShippingReturnsSection,
  updateStoreShippingReturnsSection,
  deleteStoreShippingReturnsSection,
  reorderStoreShippingReturnsSections,
} from "@/lib/actions";
import { CheckCircle, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface ShippingReturnsSettingsProps {
  storeId: string;
  sections: StoreShippingReturnsSection[];
}

function sortSections(items: StoreShippingReturnsSection[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ShippingReturnsSettings({ storeId, sections }: ShippingReturnsSettingsProps) {
  const [items, setItems] = useState<StoreShippingReturnsSection[]>(() => sortSections(sections));
  const [newHeading, setNewHeading] = useState("");
  const [newContent, setNewContent] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!newHeading.trim() || !newContent.trim()) {
      setError("Heading and content are required");
      return;
    }

    setLoadingAdd(true);

    try {
      const created = await createStoreShippingReturnsSection(storeId, {
        heading: newHeading.trim(),
        content: newContent.trim(),
      });

      setItems((prev) => sortSections([...prev, created]));
      setNewHeading("");
      setNewContent("");
      setSuccess("Shipping & Returns section added successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add section");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSave = async (sectionId: string) => {
    setError(null);
    setSuccess(null);
    setSavingId(sectionId);

    const section = items.find((item) => item.id === sectionId);

    if (!section) {
      setError("Section not found");
      setSavingId(null);
      return;
    }

    if (!section.heading.trim() || !section.content.trim()) {
      setError("Heading and content are required");
      setSavingId(null);
      return;
    }

    try {
      const updated = await updateStoreShippingReturnsSection(sectionId, {
        heading: section.heading.trim(),
        content: section.content.trim(),
      });

      setItems((prev) =>
        sortSections(prev.map((item) => (item.id === sectionId ? updated : item)))
      );
      setSuccess("Shipping & Returns section updated successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update section");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (sectionId: string) => {
    const confirmed = window.confirm("Delete this shipping & returns section?");

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteStoreShippingReturnsSection(sectionId);
      setItems((prev) => prev.filter((item) => item.id !== sectionId));
      setSuccess("Shipping & Returns section deleted");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete section");
    }
  };

  const handleReorder = async (sectionId: string, direction: "up" | "down") => {
    const ordered = sortSections(items);
    const index = ordered.findIndex((item) => item.id === sectionId);

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
      await reorderStoreShippingReturnsSections(storeId, reindexed.map((item) => item.id));
      setSuccess("Shipping & Returns section order updated");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder sections");
      router.refresh();
    }
  };

  const handleFieldChange = (
    sectionId: string,
    field: "heading" | "content",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === sectionId
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
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="border-l-4 border-l-[var(--primary)] border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-[rgba(var(--primary-rgb),0.02)] to-transparent">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary)' }}>Add a new section</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Heading</label>
            <input
              type="text"
              value={newHeading}
              onChange={(event) => setNewHeading(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
              placeholder="e.g., Shipping Policy, Return Policy, Refund Process"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Content</label>
            <textarea
              value={newContent}
              onChange={(event) => setNewContent(event.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 resize-none"
              placeholder="Describe your shipping times, return windows, refund policies, etc."
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={loadingAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: 'var(--primary)',
            }}
          >
            <Plus className="h-4 w-4" />
            {loadingAdd ? "Adding..." : "Add section"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-sm text-gray-400 italic text-center py-8 border border-dashed border-gray-200 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
            No shipping & returns sections yet. Add your first section above.
          </div>
        )}

        {items.map((section, index) => (
          <div key={section.id} className="border-l-4 border-l-[var(--primary)] border border-gray-200 rounded-xl p-4 space-y-3 transition-shadow duration-200 hover:shadow-sm">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Section #{index + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(section.id, "up")}
                  disabled={index === 0}
                  className="p-2 rounded-lg border border-gray-200 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(section.id, "down")}
                  disabled={index === items.length - 1}
                  className="p-2 rounded-lg border border-gray-200 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(section.id)}
                  className="p-2 rounded-lg border border-gray-200 text-red-600 hover:text-red-700 hover:border-red-200"
                  aria-label="Delete section"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Heading</label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(event) =>
                    handleFieldChange(section.id, "heading", event.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Content</label>
                <textarea
                  value={section.content}
                  onChange={(event) =>
                    handleFieldChange(section.id, "content", event.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleSave(section.id)}
                disabled={savingId === section.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary)',
                }}
              >
                {savingId === section.id ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
