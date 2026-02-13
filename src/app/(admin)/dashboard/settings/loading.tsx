export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        <div className="h-4 w-56 bg-gray-100 rounded mt-2" />
      </div>
      {/* Tab bar skeleton */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 bg-gray-100 rounded-lg" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
