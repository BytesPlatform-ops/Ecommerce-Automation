export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] bg-muted" />

      {/* Trust bar skeleton */}
      <div className="border-b border-border py-8 sm:py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <div className="h-5 w-5 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products skeleton */}
      <div className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="mb-10 sm:mb-12">
            <div className="h-3 w-16 bg-muted rounded mb-2" />
            <div className="h-8 w-48 bg-muted rounded" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-border bg-background overflow-hidden">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
