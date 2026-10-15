"use client";

import { useEffect, useState } from "react";
import { PropertiesHeader } from "./properties-header";
import { AttentionBanner } from "./attention-banner";
import { FilterTabs } from "./filter-tabs";
import { PropertiesList } from "./properties-list";
import { Submission } from "./types";
import { useRouter } from "next/navigation";

export function PropertiesContainer() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const url = filter
      ? `/api/agent/properties?status=${filter}`
      : "/api/agent/properties";

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setSubmissions(d.submissions || []))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filter]);

  const needsAttention = submissions.filter((s) => s.status === "correction_required").length;

    function handleBack() {
     router.back();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PropertiesHeader count={submissions.length} needsAttention={needsAttention} />
      <AttentionBanner needsAttention={needsAttention} onViewClick={() => setFilter("correction_required")} />
      <FilterTabs active={filter} onChange={setFilter} />
      <PropertiesList loading={loading} submissions={submissions} filter={filter} />
    </div>
  );
}
