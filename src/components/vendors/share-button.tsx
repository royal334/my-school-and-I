"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareButton() {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Copy Link
    </Button>
  );
}
