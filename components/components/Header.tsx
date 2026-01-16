import Link from "next/link";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-white hover:text-white/80"
        >
          Meghan Molloy
        </Link>

        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/70 hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/chat"
            className="rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Ask Meghan
          </Link>
        </nav>
      </div>
    </header>
  );
}
