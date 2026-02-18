export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse">
        <div>
          <div className="h-8 w-48 dash-shimmer" />
          <div className="h-4 w-64 dash-shimmer mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 dash-shimmer rounded-xl" />
          <div className="h-10 w-36 dash-shimmer rounded-xl" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 dash-shimmer" />
                <div className="h-9 w-20 dash-shimmer" />
                <div className="h-3 w-28 dash-shimmer" />
              </div>
              <div className="h-12 w-12 dash-shimmer rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Insights skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="h-5 w-40 dash-shimmer mb-2" />
          <div className="h-4 w-48 dash-shimmer mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-4 dash-shimmer" />
                <div className="flex-1 h-8 dash-shimmer rounded-lg" />
                <div className="w-16 h-4 dash-shimmer" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="h-5 w-28 dash-shimmer mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-16 dash-shimmer" />
                  <div className="h-4 w-20 dash-shimmer" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="h-5 w-24 dash-shimmer mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 rounded-xl p-3 h-16 dash-shimmer" />
              <div className="bg-white/80 rounded-xl p-3 h-16 dash-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions & orders skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="h-5 w-28 dash-shimmer mb-5" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 dash-shimmer rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="h-5 w-32 dash-shimmer mb-5" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 dash-shimmer rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
