export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <h1 className="text-4xl font-semibold tracking-tight mb-8">
          About Me
        </h1>

        {/* Intro */}
        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          I’m Meghan Molloy — a creative, marketing, and technology professional
          who sits at the intersection of strategy and execution. I specialize
          in translating big ideas into systems that actually work, whether that
          means building AI-powered tools, shaping digital brands, or turning
          data into decisions that move the needle.
        </p>

        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          My background spans digital marketing, analytics, product strategy,
          and creative direction, with a strong focus on emerging technology —
          especially generative AI. I’ve led cross-functional initiatives,
          managed complex digital ecosystems, and built solutions that connect
          business goals with real-world user needs.
        </p>

        {/* What You Do */}
        <h2 className="text-2xl font-medium mt-12 mb-4">
          What I Do
        </h2>

        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>Design and implement AI-driven systems and workflows</li>
          <li>Lead digital marketing and analytics strategy</li>
          <li>Bridge creative vision with technical execution</li>
          <li>Build and manage websites, platforms, and digital products</li>
          <li>Turn complex ideas into clear, measurable outcomes</li>
        </ul>

        {/* Experience */}
        <h2 className="text-2xl font-medium mt-12 mb-4">
          Experience & Approach
        </h2>

        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          I’ve worked across industries — from commercial and consumer-facing
          brands to government-adjacent and regulated environments — often
          operating in roles that require both creative intuition and technical
          rigor. I’m comfortable owning projects end-to-end: from strategy and
          concepting, to implementation, testing, and iteration.
        </p>

        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          I care deeply about clarity, usability, and impact. I don’t believe in
          building things just because they’re trendy — I believe in building
          things because they solve real problems, scale intelligently, and
          create value for both users and organizations.
        </p>

        {/* Personal Note */}
        <h2 className="text-2xl font-medium mt-12 mb-4">
          Outside of Work
        </h2>

        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          Outside of my professional work, I’m constantly learning, experimenting,
          and building. I enjoy exploring new technologies, creative projects,
          and ideas that sit just ahead of the curve. Curiosity drives everything
          I do — and I bring that mindset into every project I take on.
        </p>

        {/* Closing */}
        <p className="text-lg text-gray-300 leading-relaxed mt-10">
          If you’re interested in my background, experience, or the kind of work
          I’m excited about next, feel free to explore the site — or ask me
          directly through the chat.
        </p>
      </div>
    </main>
  );
}
