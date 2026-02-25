"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/actions";
import {
  CheckCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Package,
  Tag,
} from "lucide-react";

interface CategoryItem {
  id: string;
  storeId: string;
  name: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
}

interface CategorySettingsProps {
  storeId: string;
  categories: CategoryItem[];
}

function sortCategories(items: CategoryItem[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function CategorySettings({ storeId, categories }: CategorySettingsProps) {
  const [items, setItems] = useState<CategoryItem[]>(() => sortCategories(categories));
  const [newName, setNewName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!newName.trim()) {
      setError("Category name is required");
      return;
    }

    setLoadingAdd(true);

    try {
      const created = await createCategory(storeId, {
        name: newName.trim(),
      });

      setItems((prev) =>
        sortCategories([...prev, { ...created, productCount: 0 }])
      );
      setNewName("");
      setSuccess("Category added successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSave = async (categoryId: string) => {
    setError(null);
    setSuccess(null);
    setSavingId(categoryId);

    const cat = items.find((item) => item.id === categoryId);

    if (!cat) {
      setError("Category not found");
      setSavingId(null);
      return;
    }

    if (!cat.name.trim()) {
      setError("Category name is required");
      setSavingId(null);
      return;
    }

    try {
      const updated = await updateCategory(categoryId, {
        name: cat.name.trim(),
        isPublished: cat.isPublished,
      });

      setItems((prev) =>
        sortCategories(
          prev.map((item) =>
            item.id === categoryId
              ? { ...item, ...updated }
              : item
          )
        )
      );
      setSuccess("Category updated successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const cat = items.find((item) => item.id === categoryId);
    const confirmMsg = cat && cat.productCount > 0
      ? `Delete "${cat.name}"? ${cat.productCount} product(s) will become uncategorized.`
      : `Delete "${cat?.name}"?`;

    if (!confirm(confirmMsg)) return;

    setError(null);
    setSuccess(null);

    try {
      await deleteCategory(categoryId);
      setItems((prev) => prev.filter((item) => item.id !== categoryId));
      setSuccess("Category deleted");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleTogglePublish = async (categoryId: string) => {
    const cat = items.find((item) => item.id === categoryId);
    if (!cat) return;

    setError(null);
    setSavingId(categoryId);

    try {
      const updated = await updateCategory(categoryId, {
        isPublished: !cat.isPublished,
      });

      setItems((prev) =>
        sortCategories(
          prev.map((item) =>
            item.id === categoryId
              ? { ...item, isPublished: updated.isPublished }
              : item
          )
        )
      );
      setSuccess(updated.isPublished ? "Category published" : "Category hidden");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle publish status");
    } finally {
      setSavingId(null);
    }
  };

  const handleMove = async (categoryId: string, direction: "up" | "down") => {
    const index = items.findIndex((item) => item.id === categoryId);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    // Update sortOrder values
    const reordered = newItems.map((item, i) => ({ ...item, sortOrder: i }));
    setItems(reordered);

    try {
      await reorderCategories(
        storeId,
        reordered.map((item) => item.id)
      );
      router.refresh();
    } catch {
      // Revert on failure
      setItems(sortCategories(items));
      setError("Failed to reorder categories");
    }
  };

  const handleNameChange = (categoryId: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === categoryId ? { ...item, name: newName } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Add New Category */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-blue-600" />
          Add New Category
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Category name..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            maxLength={200}
          />
          <button
            onClick={handleAdd}
            disabled={loadingAdd || !newName.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {loadingAdd ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Categories List */}
      {items.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {items.map((cat, index) => (
              <div
                key={cat.id}
                className={`p-4 sm:p-5 transition-colors ${
                  !cat.isPublished ? "bg-gray-50/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(cat.id, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMove(cat.id, "down")}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Category Icon */}
                  <div className="h-9 w-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="h-4 w-4 text-amber-600" />
                  </div>

                  {/* Name Input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleNameChange(cat.id, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      maxLength={200}
                    />
                  </div>

                  {/* Product Count */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                    <Package className="h-3.5 w-3.5" />
                    <span>{cat.productCount} {cat.productCount === 1 ? "product" : "products"}</span>
                  </div>

                  {/* Published Toggle */}
                  <button
                    onClick={() => handleTogglePublish(cat.id)}
                    disabled={savingId === cat.id}
                    className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                      cat.isPublished
                        ? "text-green-600 bg-green-50 hover:bg-green-100"
                        : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                    }`}
                    title={cat.isPublished ? "Published — click to hide" : "Hidden — click to publish"}
                  >
                    {cat.isPublished ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSave(cat.id)}
                    disabled={savingId === cat.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {savingId === cat.id ? "Saving..." : "Save"}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile product count */}
                <div className="sm:hidden mt-2 ml-[4.5rem] text-xs text-gray-500 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  <span>{cat.productCount} {cat.productCount === 1 ? "product" : "products"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-amber-50 rounded-2xl mb-4">
            <Tag className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Create categories to organize your products on your storefront. Products without a category will appear in an &quot;Other&quot; section.
          </p>
        </div>
      )}
    </div>
  );
}
