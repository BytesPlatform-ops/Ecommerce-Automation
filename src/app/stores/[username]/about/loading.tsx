export default function SubpageLoading() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="h-3 w-16 bg-muted rounded mx-auto" />
          <div className="h-10 w-64 bg-muted rounded mx-auto" />
          <div className="w-12 h-px bg-border mx-auto" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded mx-auto" />
            <div className="h-4 w-4/6 bg-muted rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
