"use client";

import React, { useState, useMemo } from "react";
import { computeWordDiff, type DiffToken } from "@/lib/diff/word-diff";
import { Columns, AlignLeft } from "lucide-react";

export function ContractDiffViewer({
  originalText,
  revisedText,
}: {
  originalText: string;
  revisedText: string;
}) {
  const [mode, setMode] = useState<"inline" | "split">("inline");

  const diffTokens = useMemo(() => {
    return computeWordDiff(originalText, revisedText);
  }, [originalText, revisedText]);

  return (
    <div className="rounded-lg border border-rule bg-surface p-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-rule pb-2.5">
        <span className="text-xs font-semibold uppercase text-ink tracking-wide">
          Interactive Word Redline Diff
        </span>
        <div className="flex items-center rounded-md border border-rule bg-raised p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("inline")}
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium transition-colors cursor-pointer ${
              mode === "inline"
                ? "bg-surface text-ink shadow-2xs"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            <AlignLeft className="size-3" />
            <span>Inline</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium transition-colors cursor-pointer ${
              mode === "split"
                ? "bg-surface text-ink shadow-2xs"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            <Columns className="size-3" />
            <span>Side-by-side</span>
          </button>
        </div>
      </div>

      {mode === "inline" ? (
        <div className="mt-3 font-contract text-sm leading-relaxed text-ink bg-[#fafbfc] p-3.5 rounded-md border border-rule">
          <p className="flex flex-wrap gap-x-1.5 gap-y-1">
            {diffTokens.map((token, i) => {
              if (token.type === "removed") {
                return (
                  <span
                    key={i}
                    className="rounded bg-red-100 px-1 py-0.5 text-red-800 line-through decoration-red-600 decoration-1 text-xs"
                    title="Removed in proposed redline"
                  >
                    {token.value}
                  </span>
                );
              }
              if (token.type === "added") {
                return (
                  <span
                    key={i}
                    className="rounded bg-emerald-100 px-1 py-0.5 font-semibold text-emerald-900 text-xs"
                    title="Added in proposed redline"
                  >
                    {token.value}
                  </span>
                );
              }
              return (
                <span key={i} className="text-xs">
                  {token.value}
                </span>
              );
            })}
          </p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rule bg-[#fafbfc] p-3">
            <span className="font-mono text-[0.6875rem] font-bold uppercase text-red-700">
              Original Draft
            </span>
            <p className="mt-1.5 font-contract text-xs leading-relaxed text-ink italic">
              &ldquo;{originalText}&rdquo;
            </p>
          </div>

          <div className="rounded-md border border-emerald-200/80 bg-emerald-50/40 p-3">
            <span className="font-mono text-[0.6875rem] font-bold uppercase text-emerald-800">
              Proposed Fair Redline
            </span>
            <p className="mt-1.5 font-contract text-xs font-medium leading-relaxed text-ink">
              &ldquo;{revisedText}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

