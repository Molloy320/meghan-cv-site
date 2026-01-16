import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <header className="space-y-6">
          <p className="text-sm tracking-wide text-white/60">Meghan Molloy</p>

          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            I build clear, high performing digital experiences that actually work.
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            I’m a creative, marketing, and technology professional working at the intersection of
            strategy and execution. I like turning messy ideas into simple systems, strong brands,
            and measurable results.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/about"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/15"
            >
              About Me
            </Link>
            <Link
              href="/chat"
              className="rounded-full border border-white/20 bg-white px-5 py-2 text-sm font-medium text-black hover:bg-white/90"
            >
              Ask Meghan
            </Link>
            <a
              href="#work"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              What I do
            </a>
          </div>
        </header>

        {/* What I do */}
        <section id="work" className="mt-16">
          <h2 className="text-xl font-semibold">What I do</h2>
          <p className="mt-2 max-w-2xl text-white/70">
            A quick overview of the lanes I operate in most often.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-semibold">Strategy to execution</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                I take an idea, tighten the narrative, map the plan, and ship something real.
                Not theory, not fluff.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-semibold">Marketing, brand, and content</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Messaging, positioning, creative direction, and performance minded marketing that
                supports actual business goals.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-semibold">AI powered systems</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                I build practical AI workflows and tools that help people move faster, make better
                decisions, and stay organized.
              </p>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-base font-semibold">Want the short version?</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Head to my About page for the overview, what I care about, and how I work.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4 hover:text-white/80"
            >
              Go to About
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-base font-semibold">Want to ask directly?</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Use the chat to ask about my experience, skills, background, or what I’m building.
            </p>
            <Link
              href="/chat"
              className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4 hover:text-white/80"
            >
              Open Ask Meghan
            </Link>
          </div>
        </section>

        {/* Footer note */}
        <footer className="mt-16 border-t border-white/10 pt-8 text-sm text-white/50">
          <p>
            Built with intention. Clean, simple, and focused on what matters.
          </p>
        </footer>
      </div>
    </main>
  );
}
