"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Star, Send, Settings, Search, GraduationCap } from "lucide-react";
import { clsx } from "clsx";

const MENU_ITEMS = [
  { href: "/", label: "Vagas", icon: Briefcase },
  { href: "/courses", label: "Pós-Graduação", icon: GraduationCap },
  { href: "/favorites", label: "Favoritas", icon: Star },
  { href: "/submitted", label: "Submetidas", icon: Send },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">Work Finder</h1>
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  pathname === href
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        Work Finder v0.1.0
      </div>
    </aside>
  );
}
