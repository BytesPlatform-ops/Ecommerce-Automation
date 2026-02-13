export default function ThemesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
        <div className="h-4 w-48 bg-gray-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <div className="flex gap-3 mb-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="h-8 w-8 bg-gray-100 rounded-full" />
            </div>
            <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
