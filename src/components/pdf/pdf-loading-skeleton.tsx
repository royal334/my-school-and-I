export default function PDFLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Controls skeleton */}
      <div className="h-14 rounded-lg bg-muted" />
      
      {/* PDF page skeleton */}
      <div className="aspect-[8.5/11] rounded-lg bg-muted" />
      
      {/* Navigation skeleton */}
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-8 w-8 rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}