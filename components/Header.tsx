"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const nav = [
  { href: "/about", label: "About" },
  { href: "/chat", label: "Ask Meghan" },
  { href: "/resume", label: "Resume" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Auto-collapse menu on scroll down
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      // close only when scrolling DOWN by a bit (avoid tiny jitter)
      if (menuOpen && delta > 8) setMenuOpen(false);

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Left: Brand */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-white hover:text-white/90"
          onClick={() => setMenuOpen(false)}
        >
          Meghan Molloy
        </Link>

        {/* Desktop: Nav (unchanged look) */}
        <nav className="hidden items-center gap-1 md:flex">
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

          {/* Contact (desktop) */}
          <a
            href="mailto:meghan@hellomeghanmolloy.com"
            className="ml-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Contact
          </a>
        </nav>

        {/* Mobile: Hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm text-white/90 transition hover:bg-white/5 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <div className="relative h-5 w-6">
            <span
              className={`absolute left-0 top-1 block h-0.5 w-6 bg-white transition-transform duration-200 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-2.5 block h-0.5 w-6 bg-white transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-4 block h-0.5 w-6 bg-white transition-transform duration-200 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden border-t border-white/10 transition-[max-height] duration-200 ease-out ${
          menuOpen ? "max-h-80" : "max-h-0"
        }`}
      >
        <nav className="mx-auto max-w-5xl px-6 py-3">
          <div className="flex flex-col gap-2">
            {nav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
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

            {/* Contact (mobile) */}
            <a
              href="mailto:meghan@hellomeghanmolloy.com"
              onClick={() => setMenuOpen(false)}
              className="mt-1 inline-flex w-fit rounded-full bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Contact
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
