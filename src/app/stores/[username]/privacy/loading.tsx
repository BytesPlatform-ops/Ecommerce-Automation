export default function PrivacyLoading() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 rounded-2xl border border-border bg-muted/30 p-8 space-y-3">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-10 w-72 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-muted/20 p-6 space-y-3">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
