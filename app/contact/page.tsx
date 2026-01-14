export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold">Contact</h1>

      <p className="mt-4 text-lg opacity-80">
        Interested in working together or learning more?  
        Feel free to reach out.
      </p>

      <div className="mt-6 space-y-4 text-sm">
        <p>
          📧 <strong>Email:</strong>{" "}
          <a
            href="mailto:meghan@example.com"
            className="underline"
          >
            meghan@example.com
          </a>
        </p>

        <p>
          💼 <strong>LinkedIn:</strong>{" "}
          <a
            href="https://linkedin.com"
            target="_blank"
            className="underline"
          >
            linkedin.com/in/yourprofile
          </a>
        </p>

        <p>
          📍 <strong>Location:</strong> Virginia Beach, VA
        </p>
      </div>
    </main>
  );
}
