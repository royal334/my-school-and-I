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
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
  const [scale, setScale] = useState(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  return (
    <>
      {/* ── Normal (inline) view ── */}
      {!isFullscreen && (
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

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={openFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Full Screen</span>
            </Button>
          </div>

          {/* PDF Display */}
          <Card className="overflow-hidden">
            <div
              className="flex justify-center bg-slate-50 p-4 cursor-zoom-in group relative"
              onClick={openFullscreen}
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
                  {/* ⚡ Only render current page */}
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
      )}

      {/* ── Full-screen overlay ── covers entire viewport incl. sidebar/header */}
      {isFullscreen && (
        <div className="fixed inset-0 z-9999 bg-slate-950 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0">
            {/* File name */}
            <p className="text-white font-medium truncate max-w-[40%] text-sm">
              {fileName}
            </p>

            {/* Page nav */}
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
                onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom + close */}
            <div className="flex items-center gap-2">
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

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 gap-1"
                onClick={closeFullscreen}
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Exit</span>
              </Button>
            </div>
          </div>

          {/* PDF content area */}
          <div className="flex-1 overflow-auto flex justify-center p-6 bg-slate-950">
            <div className="flex items-start">
              <Document
                file={fileUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale * 1.5}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
