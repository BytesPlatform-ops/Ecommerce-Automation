export default function PaymentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        <div className="h-4 w-56 bg-gray-100 rounded mt-2" />
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-gray-50 rounded-xl mt-4" />
      </div>
    </div>
  );
}
