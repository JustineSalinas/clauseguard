"use client";

import { Printer, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PrintReportButton() {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-1.5 text-xs font-medium cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-[#0c8c5e]" />
            <span className="text-[#0c8c5e]">Link copied</span>
          </>
        ) : (
          <>
            <Share2 className="size-3.5 text-ink-3" />
            <span>Copy report link</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="brand"
        size="sm"
        onClick={handlePrint}
        className="gap-1.5 text-xs font-semibold cursor-pointer"
      >
        <Printer className="size-3.5" />
        <span>Print or Save as PDF</span>
      </Button>
    </div>
  );
}

