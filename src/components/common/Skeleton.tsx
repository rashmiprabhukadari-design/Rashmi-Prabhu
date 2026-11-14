export function ProductCardSkeleton() {
  return (
    <div className="border border-[#EAEAEC] rounded overflow-hidden bg-white animate-pulse">
      <div className="aspect-[3/4] w-full bg-[#F5F5F6]" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-2/3 bg-[#EAEAEC] rounded" />
        <div className="h-3 w-full bg-[#F5F5F6] rounded" />
        <div className="h-3.5 w-1/2 bg-[#EAEAEC] rounded" />
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#F5F5F6] rounded ${className}`} />;
}
