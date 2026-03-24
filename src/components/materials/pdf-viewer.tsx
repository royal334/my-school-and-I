"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
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

// Configure PDF.js worker using unpkg for better reliability with v5+
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import { PDFViewerProps } from "@/utils/types";

export default function PDFViewer({ materialId, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // For now, we'll use a placeholder
  // In production, this would be a signed URL from your API
  const fileUrl = `/api/materials/view/${materialId}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    setError("Failed to load PDF. Please try again later.");
    setLoading(false);
    console.error("PDF Load Error:", error);
  }

  const previousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-slate-900">Document Preview</h3>
        <div className="flex items-center justify-between">
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 2.0}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={previousPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 min-w-[80px] text-center">
                {numPages > 0 ? `${pageNumber} / ${numPages}` : "..."}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Full Screen Toggle */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Full Screen</span>
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden border-none bg-slate-900/95 backdrop-blur-md"
                showCloseButton={false}
              >
                <DialogHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between shrink-0">
                  <DialogTitle className="text-white truncate">
                    {fileName}
                  </DialogTitle>
                  <div className="flex items-center gap-4">
                    {/* Controls inside Dialog */}
                    <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-700"
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-slate-300 w-10 text-center">
                        {Math.round(scale * 150)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-700"
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-700"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-slate-300 min-w-[60px] text-center">
                        {numPages > 0 ? `${pageNumber} / ${numPages}` : "..."}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-700"
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
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
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale * 1.5} // Larger scale for full screen
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="max-h-full"
                      />
                    </Document>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="flex justify-center overflow-auto bg-slate-100 p-4 rounded-lg cursor-zoom-in hover:bg-slate-200 transition-colors"
          onClick={() => setIsDialogOpen(true)}
          title="Click to view full screen"
        >
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-96 text-red-600">
              {error}
            </div>
          )}

          {/* PDF Document */}
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

        <div className="mt-4 rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            ⚠️ This document is watermarked with your information. Unauthorized
            sharing is prohibited.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
