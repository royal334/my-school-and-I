"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function OptimizedPDFViewer({
  fileUrl,
  fileName = "document.pdf",
}: {
  fileUrl: string;
  fileName?: string;
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div className="space-y-4">
      {/* Navigation & Actions Controls */}
      <div className="flex items-center justify-between bg-slate-100 p-4 rounded-lg">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
            disabled={currentPage >= numPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm font-medium">
          Page {currentPage} of {numPages}
        </span>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Full Screen</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden border-none bg-slate-900/95 backdrop-blur-md"
            showCloseButton={false}
          >
            <DialogHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between shrink-0">
              <DialogTitle className="text-white truncate max-w-[50%]">
                {fileName}
              </DialogTitle>
              <div className="flex items-center gap-4">
                {/* Zoom Controls inside Dialog */}
                <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-slate-300 w-10 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={zoomIn}
                    disabled={scale >= 3.0}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {/* Page Navigation inside Dialog */}
                <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-slate-300 min-w-[60px] text-center">
                    {currentPage} / {numPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, numPages))
                    }
                    disabled={currentPage >= numPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8 p-0"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-auto flex justify-center p-4 bg-slate-950/50">
              <div className="min-h-full flex items-center shadow-2xl">
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-white" />
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale * 1.5}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                    className="max-h-full"
                  />
                </Document>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PDF Display */}
      <Card className="overflow-hidden">
        <div
          className="flex justify-center bg-slate-50 p-4 cursor-zoom-in group relative"
          onClick={() => setIsDialogOpen(true)}
          title="Click to view full screen"
        >
          {pdfError ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-red-500">
              <p className="font-semibold">Failed to render PDF</p>
              <p className="text-sm">{pdfError}</p>
            </div>
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(err) => setPdfError(err.message)}
              loading={
                <div className="flex h-96 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              }
            >
              {/* ⚡ Only render current page - this is the key! */}
              <Page
                pageNumber={currentPage}
                width={800}
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            </Document>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
              <Maximize2 className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>
      </Card>

      {/* Page Navigation Dots */}
      {numPages > 0 && numPages <= 10 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
