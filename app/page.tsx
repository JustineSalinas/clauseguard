import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            Clause<span className="text-flag">Guard</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/sample"
              className="hidden rounded px-3 py-2 text-ink-2 transition-colors hover:text-ink sm:block"
            >
              See an example
            </Link>
            <Link
              href="/login"
              className="rounded px-3 py-2 text-ink-2 transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-ink px-4 py-2 font-medium text-paper transition-opacity hover:opacity-85"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="seq border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              Know what you&rsquo;re signing.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              Upload a contract and see which clauses shift risk onto you, in
              plain language, checked against the Civil Code and the Labor Code.
              Built for freelancers and small businesses who don&rsquo;t have a
              lawyer on call.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/sample"
                className="rounded bg-flag px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                See a marked-up contract
              </Link>
              <Link
                href="/signup"
                className="rounded border border-rule-2 px-5 py-3 font-medium transition-colors hover:bg-raised"
              >
                Upload your own
              </Link>
            </div>
          </div>

          {/* the signature: a contract page with a margin annotation */}
          <figure className="rise rise-doc mt-14">
            <div className="grid overflow-hidden rounded-sm border border-rule bg-surface md:grid-cols-[1fr_17rem]">
              <div className="border-b border-rule p-7 sm:p-9 md:border-r md:border-b-0">
                <p className="font-body text-[0.6875rem] tracking-[0.14em] text-ink-3 uppercase">
                  Freelance design agreement &middot; page 6
                </p>
                <div className="font-contract mt-5 space-y-4 text-[1.0625rem] leading-[1.85] text-ink">
                  <p className="text-ink-2">
                    <span className="font-bold">14.1</span>&nbsp;&nbsp;This
                    Agreement commences on the Effective Date and continues
                    until the Final Deliverable is accepted in writing by the
                    Client.
                  </p>
                  <p>
                    <span className="font-bold">14.2</span>&nbsp;&nbsp;The
                    Client may terminate this Agreement at any time,{" "}
                    <mark className="mark mark-1 bg-transparent">
                      for any reason or no reason, effective immediately upon
                      written notice
                    </mark>
                    . The Designer may not terminate this Agreement prior to
                    Final Deliverable acceptance, and{" "}
                    <mark className="mark mark-2 bg-transparent">
                      shall forfeit all accrued but unpaid fees
                    </mark>{" "}
                    upon any such attempted termination.
                  </p>
                  <p className="text-ink-2">
                    <span className="font-bold">14.3</span>&nbsp;&nbsp;Upon
                    termination, the Designer shall promptly deliver all work
                    product then in progress, whether or not complete.
                  </p>
                </div>
              </div>

              <aside className="rise rise-note bg-raised p-7 sm:p-9">
                <span className="inline-flex items-center gap-2 rounded-sm bg-flag-wash px-2 py-1 font-body text-[0.6875rem] font-semibold tracking-[0.08em] text-flag uppercase">
                  High risk
                </span>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink">
                  Only the client can walk away, and you give up fees
                  you&rsquo;ve already earned if you try to.
                </p>
                <div className="mt-5 border-t border-rule-2 pt-4">
                  <p className="font-body text-[0.6875rem] tracking-[0.12em] text-ink-3 uppercase">
                    Checked against
                  </p>
                  <p className="font-display mt-1.5 text-[0.9375rem] italic">
                    Civil Code, Art. 1308
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">
                    A contract must bind both parties. Its compliance
                    can&rsquo;t be left to the will of one of them.
                  </p>
                </div>
                <div className="mt-5 border-t border-rule-2 pt-4">
                  <p className="font-body text-[0.6875rem] tracking-[0.12em] text-ink-3 uppercase">
                    A fair version
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">
                    Either side may end the agreement on 15&ndash;30 days&rsquo;
                    notice, with payment for work already accepted.
                  </p>
                </div>
              </aside>
            </div>
            <figcaption className="mt-3 text-[0.8125rem] text-ink-3">
              One clause from a real freelance agreement, marked the way
              ClauseGuard marks it.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------------- the honesty argument ---------------- */}
      <section className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="font-body text-[0.6875rem] tracking-[0.14em] text-ink-3 uppercase">
              Why it&rsquo;s different
            </p>
            <h2 className="font-display mt-3 text-4xl leading-tight font-semibold tracking-tight text-balance">
              It tells you when it isn&rsquo;t sure.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              A general AI assistant will always give you an answer. That is the
              problem. When ClauseGuard isn&rsquo;t confident about a clause, it
              says so and points you to a person, instead of handing you a colour
              you might act on.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-sm border border-rule border-l-2 border-l-flag bg-paper p-6">
              <p className="font-body text-[0.6875rem] font-semibold tracking-[0.1em] text-flag uppercase">
                Flagged
              </p>
              <p className="mt-3 leading-relaxed">
                We&rsquo;re confident this shifts risk onto you. You get the
                clause, the reason, and what a fair version would say.
              </p>
            </div>
            <div className="rounded-sm border border-rule border-l-2 border-l-caution bg-paper p-6">
              <p className="font-body text-[0.6875rem] font-semibold tracking-[0.1em] text-caution uppercase">
                Needs a person
              </p>
              <p className="mt-3 leading-relaxed">
                We read it, but we&rsquo;re not confident enough to call it.
                We&rsquo;ll tell you that plainly rather than guess.
              </p>
            </div>
            <div className="rounded-sm border border-rule border-l-2 border-l-rule-2 bg-paper p-6">
              <p className="font-body text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-3 uppercase">
                Couldn&rsquo;t read
              </p>
              <p className="mt-3 leading-relaxed">
                Some clauses don&rsquo;t come through cleanly. We show you which
                ones we missed, so you know what hasn&rsquo;t been checked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- how it works: a real sequence ---------------- */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display max-w-xl text-4xl leading-tight font-semibold tracking-tight text-balance">
            Three steps, about two minutes.
          </h2>

          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <li>
              <p className="font-display text-3xl font-semibold text-flag">1</p>
              <h3 className="font-display mt-2 text-xl font-semibold">
                Upload the contract
              </h3>
              <p className="mt-2 leading-relaxed text-ink-2">
                PDF, Word file, or a photo of a printed page. If it can&rsquo;t
                be read, we say so before you wait.
              </p>
            </li>
            <li>
              <p className="font-display text-3xl font-semibold text-flag">2</p>
              <h3 className="font-display mt-2 text-xl font-semibold">
                Every clause gets read
              </h3>
              <p className="mt-2 leading-relaxed text-ink-2">
                Not a summary. Each numbered paragraph is checked on its own,
                against the provisions that actually govern it.
              </p>
            </li>
            <li>
              <p className="font-display text-3xl font-semibold text-flag">3</p>
              <h3 className="font-display mt-2 text-xl font-semibold">
                You see what to push back on
              </h3>
              <p className="mt-2 leading-relaxed text-ink-2">
                Marked on your own document, with the reasoning in plain
                language and a fair version to ask for.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ---------------- grounding ---------------- */}
      <section className="border-b border-rule bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-body text-[0.6875rem] tracking-[0.14em] text-ink-3 uppercase">
              Grounded
            </p>
            <h2 className="font-display mt-3 text-4xl leading-tight font-semibold tracking-tight text-balance">
              Checked against Philippine law, not general knowledge.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              A generic model tells you a clause &ldquo;seems unfair.&rdquo;
              That&rsquo;s an opinion you can&rsquo;t check and the other side
              can ignore. ClauseGuard points at the provision, so you can look it
              up and so can they.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-sm border border-rule bg-paper p-5">
              <p className="font-body text-[0.6875rem] tracking-[0.12em] text-ink-3 uppercase">
                A generic assistant says
              </p>
              <p className="font-display mt-2 text-lg italic text-ink-2">
                &ldquo;This clause seems unfair to you.&rdquo;
              </p>
            </div>
            <div className="rounded-sm border border-rule border-l-2 border-l-clear bg-paper p-5">
              <p className="font-body text-[0.6875rem] tracking-[0.12em] text-clear uppercase">
                ClauseGuard says
              </p>
              <p className="font-display mt-2 text-lg italic">
                &ldquo;This conflicts with Civil Code Art. 1308.&rdquo;
              </p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-2">
                A contract must bind both parties. Its validity or compliance
                cannot be left to the will of one of them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- who it's for ---------------- */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight">
            Built for the people who sign the most contracts and read them the
            least.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-display text-xl font-semibold">Freelancers</h3>
              <p className="mt-2 leading-relaxed text-ink-2">
                Design, development, writing, video. Client agreements you sign
                one at a time, usually at night, usually in a hurry.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">
                Small businesses
              </h3>
              <p className="mt-2 leading-relaxed text-ink-2">
                Supplier agreements, leases, service contracts. The ones too
                small to send to counsel and too big to sign blind.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">
                Anyone without a lawyer
              </h3>
              <p className="mt-2 leading-relaxed text-ink-2">
                A first read, in minutes, for a fraction of what a consultation
                costs. Not a replacement for one when the stakes are high.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- close ---------------- */}
      <section className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display mx-auto max-w-xl text-4xl leading-tight font-semibold tracking-tight text-balance">
            Read the contract before you sign it.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/sample"
              className="rounded bg-flag px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              See a marked-up contract
            </Link>
            <Link
              href="/signup"
              className="rounded border border-rule-2 px-5 py-3 font-medium transition-colors hover:bg-raised"
            >
              Upload your own
            </Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-sm border border-rule bg-raised p-5">
            <p className="font-body text-[0.6875rem] tracking-[0.12em] text-ink-3 uppercase">
              Not legal advice
            </p>
            <p className="mt-2 max-w-3xl text-[0.875rem] leading-relaxed text-ink-2">
              ClauseGuard is a first-pass review tool. It flags clauses worth a
              second look and points to the provisions that may apply. It does
              not give legal advice, and it is not a substitute for a lawyer
              when the amount at stake is significant.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-8">
            <p className="font-display text-lg font-semibold">
              Clause<span className="text-flag">Guard</span>
            </p>
            <p className="text-[0.8125rem] text-ink-3">
              A capstone project &middot; College of Liberal Arts, Sciences, and
              Education &middot; University of San Agustin
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
