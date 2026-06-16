import Link from "next/link";
import { BarChart3, BookOpen, History, LifeBuoy, Settings, Sparkles } from "lucide-react";

const links = [
  { href: "/simulator", label: "Simulator", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-400 text-sm font-black text-slate-950">
            SS
          </span>
          SpinSense
        </Link>
        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon aria-hidden className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
