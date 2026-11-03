"use client";

import { useState, useMemo } from "react";
import {
  Scale,
  Search,
  BookOpen,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
} from "lucide-react";

export interface ProvisionItem {
  _id: string;
  code: "CIVIL" | "LABOR";
  article: string;
  heading?: string | null;
  text: string;
}

const COMMON_FREELANCE_ARTICLES: Record<string, string> = {
  "1306": "Freedom of contract boundary: Stipulations cannot violate law, morals, good customs, public order, or public policy. Restricts abusive post-employment non-compete clauses.",
  "1308": "Mutuality of Contracts doctrine: Contract validity or termination cannot be left to the sole will of one party. Strikes down unilateral client cancellation terms.",
  "1309": "Third-party determination: Determination of performance may be left to a third party, whose decision is binding unless evidently inequitable.",
  "1409": "Void and Inexistent Contracts: Stipulations with an unlawful cause or that waive mandatory statutory rights are void ab initio and cannot be ratified.",
  "1170": "Liability for Damages: Parties who commit fraud, negligence, or delay in obligations are liable for damages, invalidating unilateral waiver of client breach.",
  "2201": "Foreseeable Damages limit: In contracts, debtor in good faith is liable only for natural and probable consequences, limiting uncapped contractor indemnities.",
  "106": "Contractor classification: Distinguishes legitimate independent service contractors from prohibited labor-only contracting.",
  "294": "Security of tenure & valid grounds: Sets mandatory statutory boundaries for termination of employment vs contractor agreements.",
};

export function CorpusExplorer({ provisions }: { provisions: ProvisionItem[] }) {
  const [search, setSearch] = useState("");
  const [codeFilter, setCodeFilter] = useState<"ALL" | "CIVIL" | "LABOR">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    let civil = 0;
    let labor = 0;
    for (const p of provisions) {
      if (p.code === "CIVIL") civil++;
      if (p.code === "LABOR") labor++;
    }
    return { all: provisions.length, civil, labor };
  }, [provisions]);

  const filtered = useMemo(() => {
    let list = [...provisions];

    if (codeFilter !== "ALL") {
      list = list.filter((p) => p.code === codeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.article.toLowerCase().includes(q) ||
          p.text.toLowerCase().includes(q) ||
          p.heading?.toLowerCase().includes(q) ||
          COMMON_FREELANCE_ARTICLES[p.article]?.toLowerCase().includes(q)
      );
    }

    // Sort numerically by article number when possible
    list.sort((a, b) => {
      const numA = parseInt(a.article.replace(/\D/g, ""), 10);
      const numB = parseInt(b.article.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.article.localeCompare(b.article);
    });

    return list;
  }, [provisions, codeFilter, search]);

  const handleCopyCitation = async (p: ProvisionItem) => {
    const codeName =
      p.code === "CIVIL" ? "Civil Code of the Philippines" : "Labor Code of the Philippines";
    const citation = `Article ${p.article}, ${codeName}:\n"${p.text}"`;
    await navigator.clipboard.writeText(citation);
    setCopiedId(p._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Code Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Code Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCodeFilter("ALL")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              codeFilter === "ALL"
                ? "bg-ink text-surface"
                : "border border-rule bg-surface text-ink-2 hover:bg-raised"
            }`}
          >
            All Provisions ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setCodeFilter("CIVIL")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              codeFilter === "CIVIL"
                ? "bg-[#b04000] text-white"
                : "border border-rule bg-surface text-ink-2 hover:bg-raised"
            }`}
          >
            Civil Code (RA 386) ({counts.civil})
          </button>
          <button
            type="button"
            onClick={() => setCodeFilter("LABOR")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              codeFilter === "LABOR"
                ? "bg-[#08090a] text-white"
                : "border border-rule bg-surface text-ink-2 hover:bg-raised"
            }`}
          >
            Labor Code (PD 442) ({counts.labor})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            placeholder="Search article or keyword (e.g. 1308, mutuality)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-rule-2 bg-surface pl-9 pr-8 text-xs text-ink placeholder:text-ink-3 focus:border-[#b04000] focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Quick Navigation Links for Freelancers */}
      <div className="rounded-xl border border-[#e8c6a8] bg-[#fbeee4]/40 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#b04000]">
          <ShieldAlert className="size-4" />
          <span>Core Statutory Protections for Philippine Contractors</span>
        </div>
        <p className="mt-1 text-xs text-ink-2 leading-relaxed">
          Click any key provision below to jump directly to its statutory text and legal doctrine:
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {["1308", "1306", "1409", "1170", "2201", "106"].map((art) => (
            <button
              key={art}
              type="button"
              onClick={() => {
                setSearch(art);
                setCodeFilter(parseInt(art, 10) > 200 ? "CIVIL" : "LABOR");
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#e8c6a8] bg-surface px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-[#b04000] hover:text-[#b04000]"
            >
              <Scale className="size-3 text-[#b04000]" />
              <span>Art. {art}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Provisions Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-rule bg-surface p-10 text-center">
          <BookOpen className="mx-auto size-6 text-ink-3" />
          <p className="mt-2 text-sm font-medium text-ink">No statutory provisions match your search.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCodeFilter("ALL");
            }}
            className="mt-3 text-xs font-medium text-[#b04000] underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filtered.map((p) => {
            const isCivil = p.code === "CIVIL";
            const note = COMMON_FREELANCE_ARTICLES[p.article];
            const isExpanded = expandedId === p._id;

            return (
              <article
                key={p._id}
                className="rounded-xl border border-rule bg-surface p-5 shadow-2xs transition-colors hover:border-[#cccccc]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[0.6875rem] font-semibold uppercase ${
                        isCivil
                          ? "bg-[#fbeee4] text-[#b04000]"
                          : "bg-raised text-ink-2"
                      }`}
                    >
                      {isCivil ? "Civil Code" : "Labor Code"}
                    </span>
                    <h3 className="font-display text-sm font-bold text-ink">
                      Article {p.article}
                    </h3>
                    {p.heading && (
                      <span className="text-xs text-ink-3 font-medium">· {p.heading}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCitation(p)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-rule px-2.5 py-1 text-xs font-medium text-ink-2 transition-colors hover:bg-raised hover:text-ink"
                    title="Copy full statutory citation"
                  >
                    {copiedId === p._id ? (
                      <>
                        <Check className="size-3.5 text-[#0c8c5e]" />
                        <span className="text-[#0c8c5e]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-ink-3" />
                        <span>Copy citation</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Verbatim statutory quote */}
                <div className="mt-3.5 rounded-lg border border-rule bg-[#fafbfc] p-4">
                  <p className="font-contract text-sm leading-relaxed text-ink italic">
                    &ldquo;{p.text}&rdquo;
                  </p>
                </div>

                {/* Freelancer relevance breakdown note */}
                {note && (
                  <div className="mt-3 rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 text-xs text-amber-900">
                    <span className="font-semibold text-[#b04000]">Freelance Contract Leverage: </span>
                    <span>{note}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

