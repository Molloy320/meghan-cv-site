export default function ResumePage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-semibold">Resume</h1>

      {/* SUMMARY */}
      <section className="mt-8">
        <h2 className="text-xl font-medium">Professional Summary</h2>
        <p className="mt-2 text-lg opacity-80">
          Technology-driven marketing and analytics professional with experience
          in data analytics, generative AI applications, digital marketing
          strategy, and cross-functional leadership.
        </p>
      </section>

      {/* SKILLS */}
      <section className="mt-8">
        <h2 className="text-xl font-medium">Core Skills</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm opacity-80">
          <li>Generative AI & RAG Systems</li>
          <li>Data Analytics & Visualization</li>
          <li>Product Strategy & UX</li>
          <li>Python & JavaScript</li>
          <li>SQL & Databases</li>
          <li>Digital Marketing & MarTech</li>
          <li>CRM & Automation</li>
          <li>Creative Direction</li>
        </ul>
      </section>

      {/* EXPERIENCE */}
      <section className="mt-8">
        <h2 className="text-xl font-medium">Professional Experience</h2>

        <div className="mt-4 space-y-4 text-sm opacity-80">
          <div>
            <strong>Sales & Marketing Manager</strong> — Sky Zone
            <p>
              Led marketing strategy, analytics, and promotional campaigns to
              increase customer acquisition and retention.
            </p>
          </div>

          <div>
            <strong>Marketing Director</strong> — Cavalier Auto Group
            <p>
              Oversaw digital marketing, analytics, and brand positioning across
              multiple dealership locations.
            </p>
          </div>

          <div>
            <strong>Marketing Director</strong> — Forza Corp
            <p>
              Directed data-driven marketing initiatives, customer insights,
              and campaign optimization.
            </p>
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="mt-8">
        <h2 className="text-xl font-medium">Education</h2>
        <ul className="mt-3 space-y-2 text-sm opacity-80">
          <li>
            <strong>Johns Hopkins University</strong> — Generative AI & LLM
            Development
          </li>
          <li>
            <strong>Marymount University</strong> — Business Administration
          </li>
          <li>
            <strong>Tidewater Community College</strong>
          </li>
        </ul>
      </section>

      {/* DOWNLOAD */}
      <section className="mt-10">
        <a
          href="/Molloy_Resume_2026.pdf"
          className="inline-block rounded-xl border px-6 py-3 text-sm hover:bg-black hover:text-white"
        >
          Download Resume (PDF)
        </a>
      </section>
    </main>
  );
}
