import { Suspense } from "react";
import ShippingForm from "./shipping-form";
import { Loader2 } from "lucide-react";

function ShippingLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">Loading shipping information...</p>
      </div>
    </div>
  );
}

export default function ShippingPage() {
  return (
    <Suspense fallback={<ShippingLoadingFallback />}>
      <ShippingForm />
    </Suspense>
  );
}
