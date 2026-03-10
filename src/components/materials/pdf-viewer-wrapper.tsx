"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const PDFViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
  loading: () => (
    <Card className="h-96 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-slate-500">Loading previewer...</p>
      </div>
    </Card>
  ),
});

import { PDFViewerWrapperProps } from "@/utils/types";

export default function PDFViewerWrapper(props: PDFViewerWrapperProps) {
  return <PDFViewer {...props} />;
}
