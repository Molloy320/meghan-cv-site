import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Meghan Molloy</p>

        <div className="flex items-center gap-4">
          <Link className="hover:text-white" href="/about">
            About
          </Link>
          <Link className="hover:text-white" href="/chat">
            Ask Meghan
          </Link>
          <a className="hover:text-white" href="mailto:meghan@hellomeghanmolloy.com">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}