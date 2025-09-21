"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "./navConfig";

interface MobileBottomNavProps {
  onOpenMenu?: () => void;
  menuOpen: boolean;
  controlsId?: string;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileBottomNav({
  onOpenMenu,
  menuOpen = false,
  controlsId,
  menuButtonRef,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.15)] px-2 py-1 flex justify-around items-stretch"
      aria-label="Admin mobile navigation"
    >
      {/* Optional menu toggle button */}
      {onOpenMenu &&
        (menuOpen ? (
          <button
            ref={menuButtonRef as React.RefObject<HTMLButtonElement>}
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 flex-1 text-[11px] font-medium rounded-md transition-colors text-sky-600 dark:text-sky-400"
            aria-label="Close navigation menu"
            aria-haspopup="true"
            aria-expanded="true"
            aria-controls={controlsId || undefined}
          >
            <span className="h-2 w-2 rounded-full mb-1 bg-sky-500" />
            <span className="truncate max-w-[60px]">Menu</span>
          </button>
        ) : (
          <button
            ref={menuButtonRef as React.RefObject<HTMLButtonElement>}
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 flex-1 text-[11px] font-medium rounded-md transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Open navigation menu"
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls={controlsId || undefined}
          >
            <span className="h-2 w-2 rounded-full mb-1 bg-slate-400" />
            <span className="truncate max-w-[60px]">Menu</span>
          </button>
        ))}
      {adminNavItems.slice(0, 5).map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 flex-1 text-[11px] font-medium rounded-md transition-colors ${
              active
                ? "text-sky-600 dark:text-sky-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={`h-2 w-2 rounded-full mb-1 ${
                active ? "bg-sky-500" : "bg-slate-400"
              }`}
            />
            <span className="truncate max-w-[60px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
