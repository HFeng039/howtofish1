"use client";

import { useState } from "react";

import { CloseIcon, MenuIcon } from "@/components/icons";
import { Link, usePathname } from "@/i18n/navigation";

type NavLink = {
  href: string;
  label: string;
};

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button type="button" aria-label="Menu" onClick={() => setIsOpen((open) => !open)} className="p-2 text-foreground">
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      {isOpen ? (
        <nav className="absolute inset-x-0 top-16 border-b border-border bg-background/95 p-4 backdrop-blur-md">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm ${pathname === link.href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
