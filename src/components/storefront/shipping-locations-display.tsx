import { MapPin } from "lucide-react";

interface ShippingLocation {
  id: string;
  country: string;
  cities: string[];
}

interface ShippingLocationsDisplayProps {
  locations: ShippingLocation[];
}

// Simple mapping of country names to flag emojis
const countryToFlag: Record<string, string> = {
  "United States": "🇺🇸",
  "Canada": "🇨🇦",
  "United Kingdom": "🇬🇧",
  "United States of America": "🇺🇸",
  "USA": "🇺🇸",
  "UK": "🇬🇧",
  "Australia": "🇦🇺",
  "New Zealand": "🇳🇿",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Denmark": "🇩🇰",
  "Finland": "🇫🇮",
  "Poland": "🇵🇱",
  "Portugal": "🇵🇹",
  "Greece": "🇬🇷",
  "Turkey": "🇹🇷",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "China": "🇨🇳",
  "India": "🇮🇳",
  "Singapore": "🇸🇬",
  "Malaysia": "🇲🇾",
  "Thailand": "🇹🇭",
  "Vietnam": "🇻🇳",
  "Philippines": "🇵🇭",
  "Indonesia": "🇮🇩",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Chile": "🇨🇱",
  "Colombia": "🇨🇴",
  "Peru": "🇵🇪",
  "South Africa": "🇿🇦",
  "Egypt": "🇪🇬",
  "UAE": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  "Israel": "🇮🇱",
  "Ireland": "🇮🇪",
};

function getCountryFlag(countryName: string): string {
  return countryToFlag[countryName] || "🌍";
}

export function ShippingLocationsDisplay({ locations }: ShippingLocationsDisplayProps) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <section id="shipping-locations" className="py-16 sm:py-20 lg:py-28 gradient-section-alt">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <span className="section-badge mb-4 mx-auto">
            Delivery
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight font-medium">
            We Ship To
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            We deliver our products to the following locations
          </p>
        </div>

        <div className={`grid gap-6 stagger-children ${
          locations.length === 1 
            ? "grid-cols-1 max-w-md mx-auto" 
            : locations.length === 2 
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {locations.map((location) => (
            <div
              key={location.id}
              className="shipping-location-card"
            >
              <div className="shipping-location-header mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-semibold bg-primary-light border border-primary/20"
                  >
                    {getCountryFlag(location.country)}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {location.country}
                  </h3>
                </div>
              </div>

              {location.cities.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
                    Available Cities
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {location.cities.map((city) => (
                      <span
                        key={city}
                        className="shipping-location-chip"
                      >
                        <MapPin className="h-3 w-3" style={{ color: "var(--primary)" }} strokeWidth={2} />
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--primary)" }}>
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  All cities available
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
