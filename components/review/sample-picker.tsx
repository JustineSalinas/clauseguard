import Link from "next/link";
import { SAMPLES } from "@/lib/fixtures/sample-contracts";

/**
 * Switches between the hand-written sample reviews. Plain links to
 * `?c=<slug>`, so it works without JavaScript and each sample is shareable.
 */
export function SamplePicker({ basePath, activeSlug }: { basePath: string; activeSlug: string }) {
  return (
    <nav aria-label="Sample contracts" className="-mx-1 overflow-x-auto px-1 pb-1">
      <ul className="flex w-max min-w-full gap-2">
        {SAMPLES.map((s) => {
          const active = s.slug === activeSlug;
          return (
            <li key={s.slug}>
              <Link
                href={s.slug === SAMPLES[0].slug ? basePath : `${basePath}?c=${s.slug}`}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={`flex min-h-11 flex-col justify-center rounded-lg border px-3.5 py-1.5 transition-colors ${
                  active
                    ? "border-[#b04000] bg-[#fbeee4] text-[#b04000]"
                    : "border-rule bg-surface text-ink-2 hover:border-[#e8c6a8] hover:bg-raised"
                }`}
              >
                <span className="text-[0.625rem] font-semibold tracking-wider uppercase opacity-70">
                  {s.category}
                </span>
                <span className="whitespace-nowrap text-[0.8125rem] font-semibold">{s.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
