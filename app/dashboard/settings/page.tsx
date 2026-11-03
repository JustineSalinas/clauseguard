import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  User,
  Shield,
  Scale,
  Cpu,
  Lock,
  KeyRound,
  CheckCircle2,
  Database,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | ClauseGuard",
  description: "Account and statutory analysis settings.",
};

export default async function SettingsPage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/settings");
  }

  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.users.me, {}, { token });
  const email = user?.email ?? "your account";

  return (
    <div className="min-h-screen bg-[#fafbfc] lg:flex">
      <Sidebar email={email} activeHref="/dashboard/settings" />

      <div className="flex-1">
        <main className="mx-auto max-w-4xl px-6 py-8 lg:px-10 lg:py-10">
          {/* Header */}
          <div className="border-b border-rule pb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Settings &amp; Preferences
            </h1>
            <p className="mt-1 text-[0.875rem] text-ink-2">
              Manage your account, privacy controls, and statutory review parameters.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {/* Account Information */}
            <section className="rounded-xl border border-rule bg-surface p-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-rule pb-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000]">
                  <User className="size-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-ink">Account Profile</h2>
                  <p className="text-xs text-ink-3">Your credentials and tenant identity</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-rule bg-[#fafbfc] p-4">
                  <span className="text-xs font-medium text-ink-3">Email Address</span>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">{email}</p>
                    <span className="inline-flex items-center gap-1 rounded bg-[#0c8c5e]/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-[#0c8c5e]">
                      <CheckCircle2 className="size-3" />
                      Active
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-rule bg-[#fafbfc] p-4">
                  <span className="text-xs font-medium text-ink-3">Account Tier</span>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">Research Preview</p>
                    <Link
                      href="/dashboard/billing"
                      className="text-xs font-medium text-[#b04000] hover:underline"
                    >
                      View plans →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
                <div className="flex items-center gap-2 text-xs text-ink-2">
                  <KeyRound className="size-4 text-ink-3" />
                  <span>Password credentials manage access to your uploaded contracts.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/reset-password"
                    className="rounded-md border border-rule-2 bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-raised transition-colors"
                  >
                    Change password
                  </Link>
                  <SignOutButton size="sm" variant="outline" />
                </div>
              </div>
            </section>

            {/* Legal & Statutory Corpus Configuration */}
            <section className="rounded-xl border border-rule bg-surface p-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-rule pb-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000]">
                  <Scale className="size-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-ink">
                    Philippine Statutory RAG Corpus
                  </h2>
                  <p className="text-xs text-ink-3">Grounding vector database and citation rules</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-start justify-between rounded-lg border border-rule bg-[#fafbfc] p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="size-4 text-[#b04000]" />
                      <span className="text-sm font-semibold text-ink">Civil Code of the Philippines</span>
                      <span className="rounded bg-raised px-2 py-0.5 font-mono text-[0.625rem] font-medium text-ink-2">
                        RA 386 · 210 provisions
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-2 leading-relaxed">
                      Covers mutuality of contracts (Art. 1308), autonomy of will (Art. 1306), indemnity limits, and void covenants (Art. 1409).
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#0c8c5e]">Active</span>
                </div>

                <div className="flex items-start justify-between rounded-lg border border-rule bg-[#fafbfc] p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="size-4 text-[#b04000]" />
                      <span className="text-sm font-semibold text-ink">Labor Code of the Philippines</span>
                      <span className="rounded bg-raised px-2 py-0.5 font-mono text-[0.625rem] font-medium text-ink-2">
                        PD 442 · 110 provisions
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-2 leading-relaxed">
                      Covers independent contractor classification, non-compete restraint of trade boundaries, and payment withholding standards.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#0c8c5e]">Active</span>
                </div>

                <div className="flex items-start justify-between rounded-lg border border-rule bg-[#fafbfc] p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Cpu className="size-4 text-[#b04000]" />
                      <span className="text-sm font-semibold text-ink">Retrieval &amp; Inference Pipeline</span>
                      <span className="rounded bg-raised px-2 py-0.5 font-mono text-[0.625rem] font-medium text-ink-2">
                        Cosine Vector Search
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-2 leading-relaxed">
                      Powered by 768-dimensional statutory embeddings (`gemini-embedding-001`) with strict 0.65 similarity cutoffs to prevent hallucinations.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#0c8c5e]">Calibrated</span>
                </div>
              </div>
            </section>

            {/* Privacy & RA 10173 Governance */}
            <section className="rounded-xl border border-rule bg-surface p-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-rule pb-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000]">
                  <Shield className="size-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-ink">
                    Privacy &amp; Data Protection
                  </h2>
                  <p className="text-xs text-ink-3">Republic Act No. 10173 compliance</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3.5 text-xs text-ink-2">
                <div className="flex items-start gap-3 rounded-lg border border-rule bg-[#fafbfc] p-3.5">
                  <Lock className="size-4 shrink-0 text-[#0c8c5e] mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink">Zero Public Model Training</p>
                    <p className="mt-0.5 text-ink-3">
                      Your uploaded contracts and extracts are never retained or used to train Google, OpenAI, or any third-party foundation models.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-rule bg-[#fafbfc] p-3.5">
                  <CheckCircle2 className="size-4 shrink-0 text-[#0c8c5e] mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink">Tenant Storage Isolation</p>
                    <p className="mt-0.5 text-ink-3">
                      All files and segmented clause vectors are cryptographically tied to your Convex account ID and inaccessible to any other user.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Capstone Attribution */}
            <div className="rounded-lg border border-dashed border-rule-2 p-4 text-center text-xs text-ink-3">
              ClauseGuard is a capstone research project at the College of Liberal Arts, Sciences, and Education, University of San Agustin.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

