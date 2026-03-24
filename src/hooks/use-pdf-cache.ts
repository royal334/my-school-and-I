"use client";

import { useEffect, useState } from "react";

export function usePDFCache(
  materialId: string,
  fetchUrl: () => Promise<string>,
) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPDF() {
      const cacheKey = `pdf-url-${materialId}`;

      try {
        // 1. Check cache first
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
          const data = JSON.parse(cached);
          const now = Date.now();

          // Cache valid for 50 minutes (signed URL expires in 60)
          if (now - data.timestamp < 50 * 60 * 1000 && data.url) {
            console.log("✅ Loaded from cache");
            setPdfUrl(data.url);
            setLoading(false);
            return;
          }

          // Cache expired or invalid
          sessionStorage.removeItem(cacheKey);
        }

        // 2. Fetch fresh URL
        console.log("📥 Fetching fresh URL...");
        const url = await fetchUrl();

        if (!url) {
          throw new Error("No URL returned from server");
        }

        // 3. Cache it
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ url, timestamp: Date.now() }),
        );

        setPdfUrl(url);
      } catch (err) {
        console.error("❌ Failed to load PDF URL:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    }

    loadPDF();
  }, [materialId]);

  return { pdfUrl, loading, error };
}
