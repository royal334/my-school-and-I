"use client";

import { usePDFCache } from "@/hooks/use-pdf-cache";
import PDFLoadingSkeleton from "./pdf-loading-skeleton";
import dynamic from "next/dynamic";
import { AlertCircle } from "lucide-react";

const OptimizedPDFViewer = dynamic(() => import("./optimised-pdf-viewer"), {
  ssr: false,
  loading: () => <PDFLoadingSkeleton />,
});

export default function PDFViewerWrapper({
  materialId,
  fileName,
}: {
  materialId: string;
  fileName: string;
}) {
  const { pdfUrl, loading, error } = usePDFCache(materialId, async () => {
    const response = await fetch(`/api/materials/${materialId}/pdf`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    const data = await response.json();
    return data.url;
  });

  if (loading) {
    return <PDFLoadingSkeleton />;
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-10 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <div>
          <p className="font-semibold text-red-700">Failed to load PDF</p>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  return <OptimizedPDFViewer fileUrl={pdfUrl} fileName={fileName} />;
}
