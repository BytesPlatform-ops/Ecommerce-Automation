"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MapPin, User, Building2, Phone, Package, ArrowLeft, ShoppingBag, AlertCircle, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";
import Image from "next/image";
import { validateAddress, validateAddressField, type AddressValidationResult } from "@/lib/address-validation";
import { CITIES_BY_COUNTRY, COUNTRY_CONFIGS, AVAILABLE_COUNTRIES } from "@/lib/shipping-data";

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

export default function ShippingPage() {
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

  const [formData, setFormData] = useState<ShippingFormData>({
    country: "United States",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "Nevada",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    // Load cart data from localStorage
    const cart = localStorage.getItem("ecommerce-cart");
    if (cart) {
      const parsedCart = JSON.parse(cart);
      setCartData(parsedCart);
    } else {
      // No cart data, redirect back to store
      router.back();
    }
  }, [router]);

  // Load cities for selected country
  useEffect(() => {
    try {
      // Get cities for the selected country
      const cities = CITIES_BY_COUNTRY[formData.country] || [];
      setAvailableCities(cities);
      setCitySuggestions([]);
    } catch (err) {
      console.error("Error loading cities:", err);
      setAvailableCities([]);
    }
  }, [formData.country]);

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
    // Update form data
    setFormData((prev) => ({
      ...prev,
      city: value,
    }));

    // Filter cities based on input
    if (value.trim() === "") {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    } else {
      const filtered = availableCities
        .filter((city) =>
          city.toLowerCase().startsWith(value.toLowerCase())
        )
        .slice(0, 5); // Show max 5 suggestions

      setCitySuggestions(filtered);
      setShowCitySuggestions(filtered.length > 0);
    }

    // Validate on change if field was touched
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

    // Validate the selected city
    validateField("city", cityName);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for country change
    if (name === "country") {
      const countryConfig = COUNTRY_CONFIGS[value];
      const firstStateOption = countryConfig?.options[0]?.value || "";
      
      setFormData({
        ...formData,
        country: value,
        state: firstStateOption,
        zipCode: "", // Clear postal code when country changes
        city: "", // Clear city when country changes
      });
      
      // Clear suggestions and other state
      setCitySuggestions([]);
      setShowCitySuggestions(false);

      // Clear field errors and warnings when country changes
      setFieldErrors({});
      setFieldWarnings({});
      setTouchedFields(new Set());
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Only validate if field has been touched
      if (touchedFields.has(name)) {
        validateField(name, value);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields((prev) => new Set([...prev, name]));

    // Validate on blur
    validateField(name, value);

    // Check for warnings after validation (ZIP code to state alignment)
    if (name === "zipCode" || name === "state") {
      const zipCode = name === "zipCode" ? value : formData.zipCode;
      const state = name === "state" ? value : formData.state;
      const city = formData.city;

      if (zipCode && state) {
        const validation = validateAddressField("zipCode", zipCode, state);
        if (!validation.isValid && validation.error) {
          // This is an error, already set above
        }
      }
    }
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

    // Mark all fields as touched for validation display
    const allFields = ["firstName", "lastName", "address", "city", "state", "zipCode", "phone"];
    setTouchedFields(new Set(allFields));

    // Perform comprehensive validation
    const validation = validateAddress(
      formData.firstName,
      formData.lastName,
      formData.address,
      formData.city,
      formData.state,
      formData.zipCode,
      formData.phone,
      formData.country
    );

    if (!validation.isValid) {
      // Set field errors for display
      const newErrors: FieldErrors = {};
      validation.errors.forEach((error) => {
        // Map error to field
        if (error.toLowerCase().includes("first name")) newErrors.firstName = error;
        else if (error.toLowerCase().includes("last name")) newErrors.lastName = error;
        else if (error.toLowerCase().includes("address")) newErrors.address = error;
        else if (error.toLowerCase().includes("city")) newErrors.city = error;
        else if (error.toLowerCase().includes("state")) newErrors.state = error;
        else if (error.toLowerCase().includes("zip")) newErrors.zipCode = error;
        else if (error.toLowerCase().includes("phone")) newErrors.phone = error;
      });
      setFieldErrors(newErrors);
      setError("Please fix the errors below before continuing");
      return;
    }

    if (validation.warnings.length > 0) {
      // Show warning dialog but allow submission
      const proceed = window.confirm(
        `${validation.warnings.join("\n\n")}\n\nDo you want to continue anyway?`
      );
      if (!proceed) {
        return;
      }
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
        // Clear cart and redirect to Stripe
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Loading shipping information...</p>
        </div>
      </div>
    );
  }

  const cartTotal = cartData.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-background py-12 px-6 sm:py-16">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
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
          {/* Shipping Form */}
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
                {/* Country/Region */}
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
                    {Object.keys(COUNTRY_CONFIGS).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* First name & Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      First name
                    </label>
                    <div className="relative">
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
                    </div>
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
                    <div className="relative">
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
                    </div>
                    {isFieldInvalid("lastName") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company (optional) */}
                <div>
                  <label htmlFor="company" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Company <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                  />
                </div>

                {/* Address */}
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
                    placeholder="3680 Howard Hughes Parkway"
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
                  {!isFieldInvalid("address") && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Add a house number if you have one
                    </p>
                  )}
                </div>

                {/* Apartment, suite, etc. (optional) */}
                <div>
                  <label htmlFor="apartment" className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Apartment, suite, etc. <span>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground focus:outline-none focus:border-foreground transition-colors duration-200"
                  />
                </div>

                {/* City, State, ZIP code */}
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
                          // Delay closing suggestions to allow click
                          setTimeout(() => setShowCitySuggestions(false), 200);
                        }}
                        onFocus={() => {
                          if (citySuggestions.length > 0) {
                            setShowCitySuggestions(true);
                          }
                        }}
                        placeholder="Las Vegas"
                        className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                          isFieldInvalid("city")
                            ? "border-red-400"
                            : "border-border focus:border-foreground"
                        }`}
                        required
                      />
                      
                      {/* City suggestions dropdown */}
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border border-border shadow-lg">
                          {citySuggestions.map((city, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectCity(city)}
                              onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing on click
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
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-background border text-sm text-foreground focus:outline-none transition-colors duration-200 ${
                        isFieldInvalid("state")
                          ? "border-red-400"
                          : "border-border focus:border-foreground"
                      }`}
                      required
                    >
                      {COUNTRY_CONFIGS[formData.country]?.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                      placeholder={COUNTRY_CONFIGS[formData.country]?.postalPlaceholder || "89169"}
                      className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors duration-200 ${
                        isFieldInvalid("zipCode")
                          ? "border-red-400"
                          : "border-border focus:border-foreground"
                      }`}
                      required
                    />
                    {isFieldInvalid("zipCode") && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
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
                  {isFieldInvalid("phone") && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
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

          {/* Order Summary */}
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
