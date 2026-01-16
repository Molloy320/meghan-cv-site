export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          {/* Debug marker so we know THIS file deployed */}
          <div className="mb-3 text-xs text-white/40">
            ABOUT PAGE VERSION: PHOTO TEST
          </div>

          {/* Photo */}
          <div className="mb-6 h-[220px] w-[220px] overflow-hidden rounded-full shadow-lg">
            <img
              src="/meghan.png"
              alt="Meghan Molloy"
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">About Me</h1>

          <p className="mt-4 text-sm text-white/70">
            I’m Meghan Molloy, a creative, marketing, and technology professional who
            works at the intersection of strategy and execution. I specialize in turning
            big ideas into systems that actually work, whether that means building AI
            powered tools, shaping digital brands, or translating data into decisions
            that move the needle.
          </p>

          <p className="mt-4 text-sm text-white/70">
            My background spans digital marketing, analytics, product strategy, and
            creative direction, with a strong focus on emerging technology, especially
            generative AI. I’ve led cross functional initiatives, managed complex digital
            ecosystems, and built solutions that connect business goals with real world
            user needs.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">What I Do</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/80">
            <li>Design and implement AI driven systems and workflows</li>
            <li>Lead digital marketing and performance analytics strategy</li>
            <li>Bridge creative vision with technical execution</li>
            <li>Build and manage websites, platforms, and digital products</li>
            <li>Turn complex ideas into clear, measurable outcomes</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">Experience and Approach</h2>

          <p className="mt-4 text-sm text-white/70">
            I’ve worked across industries, from commercial and consumer facing brands to
            government adjacent and regulated environments. My roles often require both
            creative intuition and technical rigor. I’m comfortable owning projects end to
            end, from strategy and concepting through implementation, testing, and iteration.
          </p>

          <p className="mt-4 text-sm text-white/70">
            I care deeply about clarity, usability, and impact. I don’t build things just
            because they are trendy. I build things because they solve real problems, scale
            intelligently, and create value for both users and organizations.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">Outside of Work</h2>

          <p className="mt-4 text-sm text-white/70">
            Outside of my professional work, I’m constantly learning, experimenting, and
            building. I enjoy exploring new technologies, creative projects, and ideas that
            sit just ahead of the curve. Curiosity drives everything I do, and I bring that
            mindset into every project I take on.
          </p>

          <p className="mt-6 text-sm text-white/70">
            If you’re interested in my background, experience, or the kind of work I’m
            excited about next, feel free to explore the site or ask me directly through the chat.
          </p>
        </section>
      </div>
    </main>
  );
}
