"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MapPin, User, Building2, Phone, Package, ArrowLeft, ShoppingBag, AlertCircle, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";
import Image from "next/image";
import { isValidPhoneNumber, validateAddressField, type AddressValidationResult } from "@/lib/address-validation";

interface ShippingFormData {
  country: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface FieldErrors {
  [key: string]: string | null;
}

interface FieldWarnings {
  [key: string]: string | null;
}

// Cities by country for autocomplete
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "United States": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Las Vegas", "Memphis", "Boston", "Seattle", "Denver",
    "Miami", "Atlanta", "Portland", "Detroit", "Minneapolis", "Nashville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson",
    "Fresno", "Long Beach", "Kansas City", "Oakland", "Tulsa", "Arlington", "New Orleans", "Bakersfield", "Tampa", "Aurora",
    "Anaheim", "Santa Ana", "St. Louis", "Riverside", "Corpus Christi", "Lexington", "Henderson", "Plano", "Stockton", "Cincinnati"
  ],
  "Canada": [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
    "London", "St. Catharines", "Halifax", "Windsor", "Saskatoon", "Barrie", "Kingston", "Thunder Bay", "Sudbury", "Sherbrooke"
  ],
  "United Kingdom": [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Edinburgh", "Liverpool", "Bristol", "York", "Oxford",
    "Cambridge", "Bath", "Canterbury", "Windsor", "Chester", "Nottingham", "Sheffield", "Bradford", "Hull", "Derby"
  ],
  "Australia": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City",
    "Hobart", "Fremantle", "Geelong", "Townsville", "Cairns", "Toowoomba", "Darwin", "Launceston", "Albury", "Ballarat"
  ],
};

// Country configurations
const COUNTRY_CONFIGS: Record<
  string,
  {
    label: string;
    stateLabel: string;
    postalLabel: string;
    postalPlaceholder: string;
    options: Array<{ value: string; label: string }>;
  }
> = {
  "United States": {
    label: "United States",
    stateLabel: "State",
    postalLabel: "ZIP Code",
    postalPlaceholder: "89169",
    options: [
      { value: "Nevada", label: "NV" },
      { value: "California", label: "CA" },
      { value: "Texas", label: "TX" },
      { value: "New York", label: "NY" },
      { value: "Florida", label: "FL" },
    ],
  },
  "Canada": {
    label: "Canada",
    stateLabel: "Province",
    postalLabel: "Postal Code",
    postalPlaceholder: "K1A 0B1",
    options: [
      { value: "Ontario", label: "ON" },
      { value: "Quebec", label: "QC" },
      { value: "Alberta", label: "AB" },
      { value: "British Columbia", label: "BC" },
      { value: "Manitoba", label: "MB" },
    ],
  },
  "United Kingdom": {
    label: "United Kingdom",
    stateLabel: "Region",
    postalLabel: "Postcode",
    postalPlaceholder: "SW1A 2AA",
    options: [
      { value: "England", label: "England" },
      { value: "Scotland", label: "Scotland" },
      { value: "Wales", label: "Wales" },
      { value: "Northern Ireland", label: "Northern Ireland" },
    ],
  },
  "Australia": {
    label: "Australia",
    stateLabel: "State",
    postalLabel: "Postcode",
    postalPlaceholder: "2000",
    options: [
      { value: "New South Wales", label: "NSW" },
      { value: "Victoria", label: "VIC" },
      { value: "Queensland", label: "QLD" },
      { value: "South Australia", label: "SA" },
      { value: "Western Australia", label: "WA" },
    ],
  },
};

export default function ShippingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartData, setCartData] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [fieldWarnings, setFieldWarnings] = useState<FieldWarnings>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [storeShippingLocations, setStoreShippingLocations] = useState<{ country: string; cities: string[] }[]>([]);
  const [locationsLoaded, setLocationsLoaded] = useState(false);

  const [formData, setFormData] = useState<ShippingFormData>({
    country: "",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  // Compute available countries from store shipping locations or fallback to COUNTRY_CONFIGS
  const availableCountries = storeShippingLocations.length > 0
    ? storeShippingLocations.map(loc => loc.country)
    : Object.keys(COUNTRY_CONFIGS);

  useEffect(() => {
    // Load cart data from localStorage
    const cart = localStorage.getItem("ecommerce-cart");
    if (cart) {
      const parsedCart = JSON.parse(cart);
      setCartData(parsedCart);
      
      // Fetch store shipping locations
      const sid = storeId || parsedCart[0]?.storeId;
      if (sid) {
        fetch(`/api/stores/shipping-locations?storeId=${sid}`)
          .then(res => res.json())
          .then(data => {
            if (data.locations && data.locations.length > 0) {
              setStoreShippingLocations(data.locations);
              // Set first available country as default
              const firstCountry = data.locations[0].country;
              setFormData(prev => ({ ...prev, country: firstCountry, state: "", city: "" }));
            } else {
              // Fallback to first COUNTRY_CONFIGS country
              const firstCountry = Object.keys(COUNTRY_CONFIGS)[0];
              setFormData(prev => ({ ...prev, country: firstCountry, state: "" }));
            }
            setLocationsLoaded(true);
          })
          .catch(() => {
            const firstCountry = Object.keys(COUNTRY_CONFIGS)[0];
            setFormData(prev => ({ ...prev, country: firstCountry, state: "" }));
            setLocationsLoaded(true);
          });
      }
    } else {
      // No cart data, redirect back
      router.back();
    }
  }, [router, storeId]);

  // Load cities for selected country
  useEffect(() => {
    try {
      // Use store shipping location cities if available
      const locationMatch = storeShippingLocations.find(loc => loc.country === formData.country);
      if (locationMatch && locationMatch.cities.length > 0) {
        setAvailableCities(locationMatch.cities);
      } else {
        const cities = CITIES_BY_COUNTRY[formData.country] || [];
        setAvailableCities(cities);
      }
      setCitySuggestions([]);
    } catch (err) {
      console.error("Error loading cities:", err);
      setAvailableCities([]);
    }
  }, [formData.country, storeShippingLocations]);

  const validateField = (fieldName: string, value: string) => {
    const validation = validateAddressField(
      fieldName,
      value,
      fieldName === "zipCode" ? formData.state : undefined,
      formData.country
    );
    
    if (!validation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: validation.error || null,
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  const handleCityInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      city: value,
    }));

    if (value.trim() === "") {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    } else {
      const filtered = availableCities
        .filter((city) =>
          city.toLowerCase().startsWith(value.toLowerCase())
        )
        .slice(0, 5);

      setCitySuggestions(filtered);
      setShowCitySuggestions(filtered.length > 0);
    }

    if (touchedFields.has("city")) {
      validateField("city", value);
    }
  };

  const selectCity = (cityName: string) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    validateField("city", cityName);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "country") {
      setFormData({
        ...formData,
        country: value,
        state: "",
        zipCode: "",
        city: "",
      });
      
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setFieldErrors({});
      setFieldWarnings({});
      setTouchedFields(new Set());
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      if (touchedFields.has(name)) {
        validateField(name, value);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setTouchedFields((prev) => new Set([...prev, name]));
    validateField(name, value);
  };

  const isFieldInvalid = (fieldName: string): boolean => {
    return touchedFields.has(fieldName) && !!fieldErrors[fieldName];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cartData || cartData.length === 0) {
      setError("Cart is empty");
      return;
    }

    const allFields = ["firstName", "lastName", "address", "city", "state", "phone"];
    setTouchedFields(new Set(allFields));

    // Inline validation (without postal code)
    const newErrors: FieldErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State/Province is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.country) newErrors.country = "Country is required";

    // Validate country against store shipping locations
    if (storeShippingLocations.length > 0 && formData.country) {
      const locationMatch = storeShippingLocations.find(loc => loc.country === formData.country);
      if (!locationMatch) {
        newErrors.country = "This store does not ship to " + formData.country;
      } else if (locationMatch.cities.length > 0 && formData.city.trim()) {
        const cityMatch = locationMatch.cities.some(
          c => c.toLowerCase() === formData.city.trim().toLowerCase()
        );
        if (!cityMatch) {
          newErrors.city = `This store does not ship to ${formData.city} in ${formData.country}. Available cities: ${locationMatch.cities.join(", ")}`;
        }
      }
    }

    if (Object.values(newErrors).some(e => e)) {
      setFieldErrors(newErrors);
      setError("Please fix the errors below before continuing");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      storeId: storeId || cartData[0].storeId,
      items: cartData.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
      })),
      shippingInfo: formData,
    };

    console.log("Sending checkout request with payload:", payload);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        localStorage.removeItem("ecommerce-cart");
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Checkout failed");
      setIsSubmitting(false);
    }
  };

  if (!cartData) {
    return null; // Loading fallback is in parent component
  }

  const cartTotal = cartData.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-background py-12 px-6 sm:py-16">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm">Back to Store</span>
          </button>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your delivery information to proceed with payment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="lg:order-1">
            <div className="border border-border bg-background overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-overline !text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  Delivery Information
                </h2>
              </div>

              {error && (
                <div className="mx-6 mt-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="country" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Country/Region
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                    required
                  >
                    <option value="">Select a country</option>
                    {availableCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-background border text-sm text-foreground focus:outline-none transition-colors duration-200 ${
                        isFieldInvalid("firstName")
                          ? "border-red-400"
                          : "border-border focus:border-foreground"
                      }`}
                      required
                    />
                    {isFieldInvalid("firstName") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-background border text-sm text-foreground focus:outline-none transition-colors duration-200 ${
                        isFieldInvalid("lastName")
                          ? "border-red-400"
                          : "border-border focus:border-foreground"
                      }`}
                      required
                    />
                    {isFieldInvalid("lastName") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Street address"
                    className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                      isFieldInvalid("address")
                        ? "border-red-400"
                        : "border-border focus:border-foreground"
                    }`}
                    required
                  />
                  {isFieldInvalid("address") && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-6 sm:col-span-2 relative">
                    <label htmlFor="city" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        autoComplete="off"
                        value={formData.city}
                        onChange={(e) => handleCityInputChange(e.target.value)}
                        onBlur={(e) => {
                          setTouchedFields((prev) => new Set([...prev, "city"]));
                          validateField("city", formData.city);
                          setTimeout(() => setShowCitySuggestions(false), 200);
                        }}
                        onFocus={() => {
                          if (citySuggestions.length > 0) {
                            setShowCitySuggestions(true);
                          }
                        }}
                        placeholder="City"
                        className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                          isFieldInvalid("city")
                            ? "border-red-400"
                            : "border-border focus:border-foreground"
                        }`}
                        required
                      />
                      
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border border-border shadow-lg">
                          {citySuggestions.map((city, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectCity(city)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-150 border-b border-border last:border-b-0"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {isFieldInvalid("city") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.city}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label htmlFor="state" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      {COUNTRY_CONFIGS[formData.country]?.stateLabel || "State"}
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. California"
                      className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                        isFieldInvalid("state")
                          ? "border-red-400"
                          : "border-border focus:border-foreground"
                      }`}
                      required
                    />
                    {isFieldInvalid("state") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.state}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label htmlFor="zipCode" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      {COUNTRY_CONFIGS[formData.country]?.postalLabel || "ZIP"}
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                      isFieldInvalid("phone")
                        ? "border-red-400"
                        : "border-border focus:border-foreground"
                    }`}
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-luxury btn-primary-luxury disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                        Processing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:order-2">
            <div className="border border-border bg-background overflow-hidden sticky top-8">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-overline !text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-0 divide-y divide-border mb-6">
                  {cartData.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 py-4 first:pt-0">
                      {item.imageUrl && (
                        <div className="relative w-14 h-[4.5rem] overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-foreground truncate">{item.name}</h3>
                        {item.variantInfo && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variantInfo}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at next step</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-border">
                    <span className="text-overline">Total</span>
                    <span className="text-lg font-serif tracking-tight text-foreground">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 border border-border bg-muted">
                  <div className="flex items-start gap-3">
                    <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-0.5">Secure Checkout</p>
                      <p>Your payment information is encrypted and secure.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
