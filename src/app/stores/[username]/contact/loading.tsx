export default function ContactLoading() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      <section className="border-b border-border py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-6 space-y-4">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-10 w-48 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>
      </section>
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
