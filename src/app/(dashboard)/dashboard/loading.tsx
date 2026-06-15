export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      {/* Topbar skeleton */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4">
        <div className="h-5 w-32 bg-slate-200 rounded-lg" />
        <div className="flex-1" />
        <div className="w-8 h-8 rounded-full bg-slate-200" />
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </div>

      <main className="flex-1 px-4 md:px-6 py-8 max-w-6xl mx-auto w-full">
        {/* Heading skeleton */}
        <div className="mb-8">
          <div className="h-7 w-64 bg-slate-200 rounded-lg mb-2" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 mb-4" />
              <div className="h-7 w-12 bg-slate-200 rounded-lg mb-2" />
              <div className="h-4 w-24 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="h-5 w-40 bg-slate-200 rounded-lg mb-6" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
