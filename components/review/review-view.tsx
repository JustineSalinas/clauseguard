import type { ReviewedDocument } from "@/lib/types";
import {
  BeforeAfterContractViewer,
  ReviewSummary,
  DocumentView,
  VerdictBadge,
} from "@/components/review/before-after-contract-viewer";

export function ReviewView({ doc }: { doc: ReviewedDocument }) {
  return <BeforeAfterContractViewer doc={doc} />;
}

export { BeforeAfterContractViewer, ReviewSummary, DocumentView, VerdictBadge };
