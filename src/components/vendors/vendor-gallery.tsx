import Image from "next/image";

interface VendorGalleryProps {
  images: string[];
  businessName: string;
}

export default function VendorGallery({ images, businessName }: VendorGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mb-8 mt-6">
      <h3 className="mb-4 font-semibold">Photo Gallery</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((url: string, index: number) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg border bg-slate-100 dark:border-slate-800 dark:bg-slate-900 transition-all hover:opacity-90"
          >
            <Image
              src={url}
              alt={`${businessName} gallery ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
