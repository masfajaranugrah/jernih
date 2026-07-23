export default function ProductsLoading() {
 return (
  <div className="min-h-screen bg-[#f8f9fa]">
   <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm">
     <div className="h-5 w-40 rounded-lg bg-[#e1e3e4] animate-pulse" />
     <div className="h-9 w-36 rounded-lg bg-[#003527]/20 animate-pulse" />
    </header>
    <main className="p-6">
     {/* Stats */}
     <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
       <div key={i} className="rounded-xl border border-[#e1e3e4] bg-white p-4 shadow-sm">
        <div className="h-8 w-16 rounded bg-[#e1e3e4] animate-pulse mb-2" />
        <div className="h-3 w-24 rounded bg-[#e1e3e4] animate-pulse" />
       </div>
      ))}
     </div>
     {/* Table */}
     <div className="rounded-xl border border-[#e1e3e4] bg-white shadow-sm overflow-hidden">
      <div className="border-b border-[#e1e3e4] px-6 py-4">
       <div className="h-5 w-40 rounded bg-[#e1e3e4] animate-pulse" />
      </div>
      <div className="divide-y divide-[#f3f4f5]">
       {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
         <div className="h-12 w-12 rounded-lg bg-[#e1e3e4] animate-pulse shrink-0" />
         <div className="flex-1 space-y-2">
          <div className="h-4 w-48 rounded bg-[#e1e3e4] animate-pulse" />
          <div className="h-3 w-24 rounded bg-[#e1e3e4] animate-pulse" />
         </div>
         <div className="h-4 w-20 rounded bg-[#e1e3e4] animate-pulse" />
         <div className="h-6 w-12 rounded-full bg-[#e1e3e4] animate-pulse" />
         <div className="h-6 w-14 rounded-full bg-[#e1e3e4] animate-pulse" />
         <div className="flex gap-1">
          <div className="h-8 w-8 rounded-lg bg-[#e1e3e4] animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-[#e1e3e4] animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-[#e1e3e4] animate-pulse" />
         </div>
        </div>
       ))}
      </div>
     </div>
    </main>
   </div>
  </div>
 );
}
