"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/about", label: "About" },
  { href: "/chat", label: "Ask Meghan" },
  { href: "/resume", label: "Resume" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Left: Brand */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-white hover:text-white/90"
        >
          Meghan Molloy
        </Link>

        {/* Right: Nav */}
        <nav className="flex items-center gap-1">
          {nav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Optional: Contact button (mailto) */}
          <a
            href="mailto:meghan@hellomeghanmolloy.com"
            className="ml-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
