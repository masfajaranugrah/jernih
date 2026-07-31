export function WishlistSkeleton() {
  return (
    <>
      {/* Summary Header Skeleton */}
      <section className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5 animate-pulse">
        <div>
          <div className="h-3 sm:h-4 w-28 sm:w-32 bg-neutral-200 rounded mb-1.5 sm:mb-2" />
          <div className="h-7 sm:h-8 w-48 sm:w-56 bg-neutral-200 rounded" />
          <div className="h-4 sm:h-5 w-40 sm:w-48 bg-neutral-200 rounded mt-2 sm:mt-3" />
        </div>
      </section>

      {/* Grid Cards Skeleton — samakan dengan ProductCard */}
      <section className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-[28px] bg-white p-3.5 sm:p-4 border border-neutral-100 animate-pulse"
          >
            {/* Image Placeholder */}
            <div className="aspect-square w-full rounded-[22px] bg-neutral-100 p-3">
              <div className="w-full h-full rounded-lg bg-neutral-200" />
            </div>

            {/* Content Placeholder */}
            <div className="mt-3 px-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-neutral-200 rounded" />
                <div className="h-6 w-14 bg-neutral-100 rounded-md" />
              </div>
              <div className="h-4 w-4/5 bg-neutral-200 rounded mt-0.5" />
              <div className="h-5 w-20 bg-neutral-200 rounded mt-0.5" />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

export default function Loading() {
  return <WishlistSkeleton />;
}
