export default function PDFLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Controls skeleton */}
      <div className="h-14 rounded-lg bg-slate-200" />
      
      {/* PDF page skeleton */}
      <div className="aspect-[8.5/11] rounded-lg bg-slate-200" />
      
      {/* Navigation skeleton */}
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-8 w-8 rounded bg-slate-200" />
        ))}
      </div>
    </div>
  );
}