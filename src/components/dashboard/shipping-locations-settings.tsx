"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreShippingLocation } from "@/types/database";
import {
  createStoreShippingLocation,
  updateStoreShippingLocation,
  deleteStoreShippingLocation,
  reorderStoreShippingLocations,
} from "@/lib/actions";
import {
  CheckCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  MapPin,
  X,
} from "lucide-react";

interface ShippingLocationsSettingsProps {
  storeId: string;
  locations: StoreShippingLocation[];
}

function sortLocations(items: StoreShippingLocation[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ShippingLocationsSettings({ storeId, locations }: ShippingLocationsSettingsProps) {
  const [items, setItems] = useState<StoreShippingLocation[]>(() => sortLocations(locations));
  const [newCountry, setNewCountry] = useState("");
  const [newCities, setNewCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Edit mode city inputs
  const [editCityInputs, setEditCityInputs] = useState<Record<string, string>>({});

  const handleAddCity = () => {
    const city = newCityInput.trim();
    if (city && !newCities.includes(city)) {
      setNewCities([...newCities, city]);
      setNewCityInput("");
    }
  };

  const handleRemoveNewCity = (city: string) => {
    setNewCities(newCities.filter((c) => c !== city));
  };

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!newCountry.trim()) {
      setError("Country is required");
      return;
    }

    setLoadingAdd(true);

    try {
      const created = await createStoreShippingLocation(storeId, {
        country: newCountry.trim(),
        cities: newCities,
      });

      setItems((prev) => sortLocations([...prev, created]));
      setNewCountry("");
      setNewCities([]);
      setNewCityInput("");
      setSuccess("Shipping location added successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add shipping location");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSave = async (locationId: string) => {
    setError(null);
    setSuccess(null);
    setSavingId(locationId);

    const location = items.find((item) => item.id === locationId);

    if (!location) {
      setError("Location not found");
      setSavingId(null);
      return;
    }

    if (!location.country.trim()) {
      setError("Country is required");
      setSavingId(null);
      return;
    }

    try {
      const updated = await updateStoreShippingLocation(locationId, {
        country: location.country.trim(),
        cities: location.cities,
      });

      setItems((prev) =>
        sortLocations(prev.map((item) => (item.id === locationId ? updated : item)))
      );
      setSuccess("Shipping location updated successfully");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update shipping location");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (locationId: string) => {
    const confirmed = window.confirm("Delete this shipping location?");

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteStoreShippingLocation(locationId);
      setItems((prev) => prev.filter((item) => item.id !== locationId));
      setSuccess("Shipping location deleted");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete shipping location");
    }
  };

  const handleReorder = async (locationId: string, direction: "up" | "down") => {
    const ordered = sortLocations(items);
    const index = ordered.findIndex((item) => item.id === locationId);

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
      await reorderStoreShippingLocations(storeId, reindexed.map((item) => item.id));
      setSuccess("Location order updated");
      router.refresh();

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder locations");
      router.refresh();
    }
  };

  const handleFieldChange = (
    locationId: string,
    field: "country",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === locationId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleAddCityToLocation = (locationId: string) => {
    const city = (editCityInputs[locationId] || "").trim();
    if (!city) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === locationId && !item.cities.includes(city)
          ? { ...item, cities: [...item.cities, city] }
          : item
      )
    );
    setEditCityInputs((prev) => ({ ...prev, [locationId]: "" }));
  };

  const handleRemoveCityFromLocation = (locationId: string, city: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === locationId
          ? { ...item, cities: item.cities.filter((c) => c !== city) }
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

      <div className="border-l-4 border-gray-200 rounded-xl p-4" style={{ borderLeftColor: 'var(--primary)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
          <MapPin className="h-5 w-5" />
          Add a shipping location
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Country</label>
            <input
              type="text"
              value={newCountry}
              onChange={(event) => setNewCountry(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g. United States, Canada, United Kingdom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Cities (optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCityInput}
                onChange={(event) => setNewCityInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddCity();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. New York, Los Angeles"
              />
              <button
                type="button"
                onClick={handleAddCity}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Add City
              </button>
            </div>
            {newCities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newCities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                  >
                    {city}
                    <button
                      type="button"
                      onClick={() => handleRemoveNewCity(city)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to ship to all cities in this country
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={loadingAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="h-4 w-4" />
            {loadingAdd ? "Adding..." : "Add Location"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No shipping locations yet. Add your first country above.
          </div>
        )}

        {items.map((location, index) => (
          <div key={location.id} className="border-l-4 border-gray-200 rounded-xl p-4 space-y-3" style={{ borderLeftColor: 'var(--primary)' }}>
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <MapPin className="h-4 w-4" />
                Location #{index + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(location.id, "up")}
                  disabled={index === 0}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(location.id, "down")}
                  disabled={index === items.length - 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(location.id)}
                  className="p-2 rounded-lg border border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                  aria-label="Delete location"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Country</label>
              <input
                type="text"
                value={location.country}
                onChange={(event) =>
                  handleFieldChange(location.id, "country", event.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>Cities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={editCityInputs[location.id] || ""}
                  onChange={(event) =>
                    setEditCityInputs((prev) => ({ ...prev, [location.id]: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddCityToLocation(location.id);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Add a city"
                />
                <button
                  type="button"
                  onClick={() => handleAddCityToLocation(location.id)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Add
                </button>
              </div>
              {location.cities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {location.cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => handleRemoveCityFromLocation(location.id, city)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">All cities in this country</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleSave(location.id)}
                disabled={savingId === location.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {savingId === location.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
