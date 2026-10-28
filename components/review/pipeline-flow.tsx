import { UploadCloud, ScanSearch, ListChecks, BookOpenCheck, Scale, Check, Loader2 } from "lucide-react";
import { SCORE_STAGE_DEFAULT_MODEL } from "@/lib/models";
import type { DocumentStatus } from "@/lib/types";

/**
 * Makes the pipeline's stages visible while a contract is processing,
 * instead of a plain "still reading" box. Doing this honestly means not
 * inventing a stage that doesn't exist: grounding genuinely runs as its own
 * step (lib/pipeline/ground) before every scoring call, so it gets its own
 * node here rather than being folded silently into "Score" -- this is also
 * the one place in the product that makes Objective 4's grounding step, and
 * Objective 3's active model, visible to the user at all.
 */

type NodeKey = "upload" | "extract" | "segment" | "ground" | "score";

const NODES: { key: NodeKey; label: string; detail: string; icon: typeof UploadCloud }[] = [
  { key: "upload", label: "Uploaded", detail: "Received your file", icon: UploadCloud },
  { key: "extract", label: "Reading", detail: "Pulling text from the PDF", icon: ScanSearch },
  { key: "segment", label: "Segmenting", detail: "Splitting into clauses", icon: ListChecks },
  { key: "ground", label: "Grounding", detail: "Matching Civil & Labor Code", icon: BookOpenCheck },
  { key: "score", label: "Scoring", detail: `Checking risk · ${SCORE_STAGE_DEFAULT_MODEL}`, icon: Scale },
];

// Document status -> how far through NODES we are. "scoring" lights both
// ground and score, since grounding happens inline per-clause during that
// stage rather than as its own document status. complete/partial push past
// the last index so every node -- including the last -- resolves to "done"
// instead of staying stuck on "active".
const STATUS_TO_NODE_INDEX: Record<DocumentStatus, number> = {
  uploaded: 0,
  extracting: 1,
  extracted: 1,
  segmenting: 2,
  segmented: 2,
  scoring: 4,
  partial: NODES.length,
  complete: NODES.length,
  failed: 0,
};

function nodeState(nodeIdx: number, activeIdx: number): "done" | "active" | "pending" {
  if (nodeIdx < activeIdx) return "done";
  if (nodeIdx === activeIdx) return "active";
  return "pending";
}

export function PipelineFlow({ status }: { status: DocumentStatus }) {
  const activeIdx = STATUS_TO_NODE_INDEX[status] ?? 0;
  const doneCount = Math.min(activeIdx, NODES.length - 1);
  const progressPct = (doneCount / (NODES.length - 1)) * 100;

  return (
    <div className="rounded-[8px] border border-rule bg-surface p-6 sm:p-8">
      {/* Mobile: vertical stack with a connector between each node. */}
      <div className="flex flex-col gap-0 sm:hidden">
        {NODES.map((node, i) => {
          const state = nodeState(i, activeIdx);
          const isLast = i === NODES.length - 1;
          return (
            <div key={node.key}>
              <div className="flex items-start gap-3">
                <NodeIcon node={node} state={state} />
                <NodeLabel node={node} state={state} />
              </div>
              {!isLast && (
                <div
                  className={`ml-5 h-6 w-0.5 ${state === "done" ? "bg-[#b04000]" : "bg-rule-2"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: one row of circles with a line running through their
          centers, labels in a second row aligned underneath. */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between px-5">
          <div className="absolute inset-x-5 top-1/2 h-0.5 -translate-y-1/2 bg-rule-2" />
          <div
            className="absolute left-5 top-1/2 h-0.5 -translate-y-1/2 bg-[#b04000] transition-all duration-500"
            style={{ width: `calc((100% - 2.5rem) * ${progressPct / 100})` }}
          />
          {NODES.map((node) => {
            const i = NODES.indexOf(node);
            const state = nodeState(i, activeIdx);
            return (
              <div key={node.key} className="relative z-10">
                <NodeIcon node={node} state={state} />
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-2">
          {NODES.map((node) => {
            const i = NODES.indexOf(node);
            const state = nodeState(i, activeIdx);
            return (
              <div key={node.key} className="text-center">
                <NodeLabel node={node} state={state} centered />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NodeIcon({
  node,
  state,
}: {
  node: (typeof NODES)[number];
  state: "done" | "active" | "pending";
}) {
  const Icon = node.icon;
  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
        state === "done"
          ? "border-[#b04000] bg-[#b04000] text-white"
          : state === "active"
            ? "border-[#b04000] bg-[#fbeee4] text-[#b04000]"
            : "border-rule-2 bg-surface text-ink-3"
      }`}
    >
      {state === "done" ? (
        <Check className="size-4.5" />
      ) : state === "active" ? (
        <Loader2 className="size-4.5 animate-spin" />
      ) : (
        <Icon className="size-4.5" />
      )}
    </div>
  );
}

function NodeLabel({
  node,
  state,
  centered = false,
}: {
  node: (typeof NODES)[number];
  state: "done" | "active" | "pending";
  centered?: boolean;
}) {
  return (
    <div className={`min-w-0 pt-1 ${centered ? "" : ""}`}>
      <p className={`text-[0.8125rem] font-semibold ${state === "pending" ? "text-ink-3" : "text-ink"}`}>
        {node.label}
      </p>
      <p className="mt-0.5 text-[0.75rem] leading-snug text-ink-3">{node.detail}</p>
    </div>
  );
}
