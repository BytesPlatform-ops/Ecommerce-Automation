"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreFaq } from "@/types/database";
import {
  createStoreFaq,
  updateStoreFaq,
  deleteStoreFaq,
  reorderStoreFaqs,
} from "@/lib/actions";
import {
  CheckCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface FaqSettingsProps {
  storeId: string;
  faqs: StoreFaq[];
}

function sortFaqs(items: StoreFaq[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function FaqSettings({ storeId, faqs }: FaqSettingsProps) {
  const [items, setItems] = useState<StoreFaq[]>(() => sortFaqs(faqs));
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError("Question and answer are required");
      return;
    }

    setLoadingAdd(true);

    try {
      const created = await createStoreFaq(storeId, {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      });

      setItems((prev) => sortFaqs([...prev, created]));
      setNewQuestion("");
      setNewAnswer("");
      setSuccess("FAQ added successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add FAQ");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSave = async (faqId: string) => {
    setError(null);
    setSuccess(null);
    setSavingId(faqId);

    const faq = items.find((item) => item.id === faqId);

    if (!faq) {
      setError("FAQ not found");
      setSavingId(null);
      return;
    }

    if (!faq.question.trim() || !faq.answer.trim()) {
      setError("Question and answer are required");
      setSavingId(null);
      return;
    }

    try {
      const updated = await updateStoreFaq(faqId, {
        question: faq.question.trim(),
        answer: faq.answer.trim(),
        isPublished: faq.isPublished,
      });

      setItems((prev) =>
        sortFaqs(prev.map((item) => (item.id === faqId ? updated : item)))
      );
      setSuccess("FAQ updated successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update FAQ");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (faqId: string) => {
    const confirmed = window.confirm("Delete this FAQ?");

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteStoreFaq(faqId);
      setItems((prev) => prev.filter((item) => item.id !== faqId));
      setSuccess("FAQ deleted");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete FAQ");
    }
  };

  const handleReorder = async (faqId: string, direction: "up" | "down") => {
    const ordered = sortFaqs(items);
    const index = ordered.findIndex((item) => item.id === faqId);

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
      await reorderStoreFaqs(storeId, reindexed.map((item) => item.id));
      setSuccess("FAQ order updated");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder FAQs");
      router.refresh();
    }
  };

  const handleFieldChange = (
    faqId: string,
    field: "question" | "answer" | "isPublished",
    value: string | boolean
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === faqId
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

      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Add a new FAQ</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="What is your return policy?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              value={newAnswer}
              onChange={(event) => setNewAnswer(event.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Share the full answer customers should see."
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={loadingAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {loadingAdd ? "Adding..." : "Add FAQ"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No FAQs yet. Add your first question above.
          </div>
        )}

        {items.map((faq, index) => (
          <div key={faq.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <span className="text-sm font-semibold text-gray-700">FAQ #{index + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(faq.id, "up")}
                  disabled={index === 0}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(faq.id, "down")}
                  disabled={index === items.length - 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 rounded-lg border border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                  aria-label="Delete FAQ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={faq.question}
                onChange={(event) =>
                  handleFieldChange(faq.id, "question", event.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                value={faq.answer}
                onChange={(event) =>
                  handleFieldChange(faq.id, "answer", event.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={faq.isPublished}
                  onChange={(event) =>
                    handleFieldChange(faq.id, "isPublished", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Published
              </label>

              <button
                type="button"
                onClick={() => handleSave(faq.id)}
                disabled={savingId === faq.id}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingId === faq.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
