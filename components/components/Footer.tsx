import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-10 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Meghan Molloy</p>

        <div className="flex gap-4">
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link href="/chat" className="hover:text-white">
            Ask Meghan
          </Link>
        </div>
      </div>
    </footer>
  );
}
