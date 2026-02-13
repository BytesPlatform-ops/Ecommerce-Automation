export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back link skeleton */}
        <div className="h-4 w-32 bg-muted rounded mb-8" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image skeleton */}
          <div className="aspect-square bg-muted rounded" />
          
          {/* Details skeleton */}
          <div className="space-y-6">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-6 w-1/4 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
            <div className="h-12 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
