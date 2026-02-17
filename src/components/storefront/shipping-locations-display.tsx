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
    <section id="shipping-locations" className="py-16 sm:py-20 lg:py-28">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-overline mb-3" style={{ color: "var(--primary)" }}>
            Delivery
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight font-medium">
            We Ship To
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            We deliver our products to the following locations
          </p>
        </div>

        <div className={`grid gap-6 ${
          locations.length === 1 
            ? "grid-cols-1 max-w-md mx-auto" 
            : locations.length === 2 
              ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {locations.map((location) => (
            <div
              key={location.id}
              className="p-6 rounded-2xl border border-border/60 bg-background hover:border-[var(--primary)]/30 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold"
                  style={{ backgroundColor: "rgb(0 0 0 / 0.08)" }}
                >
                  {getCountryFlag(location.country)}
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  {location.country}
                </h3>
              </div>

              {location.cities.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Available Cities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {location.cities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted/50 text-foreground"
                      >
                        <MapPin className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
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
