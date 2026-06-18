"use client";

import {
  ClockFading,
  LogOut,
  Menu,
  Presentation,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api";

type SidebarProps = {
  workspaceName: string;
};

const navigationItems = [
  {
    href: "/programs",
    label: "Programs",
    icon: Presentation,
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    icon: ClockFading,
  },
];

export function Sidebar({ workspaceName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await api.post("/auth/logout");
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("We could not log you out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  const sidebarContent = (
    <>
      <div className="border-b border-border px-6 py-7">
        <p className="text-headline-md text-primary">
          Welcome {workspaceName}
        </p>
        <p className="mt-1 text-label-md text-muted-foreground">
          Creator Studio
        </p>
      </div>

      <nav aria-label="Workspace navigation" className="flex-1 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "relative flex items-center gap-3 px-6 py-3 text-label-md transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                    isActive
                      ? "bg-surface-container-high text-primary before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-6 py-6">
        {logoutError ? (
          <p className="mb-3 text-label-sm text-error" role="alert">
            {logoutError}
          </p>
        ) : null}
        <button
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-label-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={20} strokeWidth={1.75} />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-navbar items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div>
          <p className="text-label-md font-semibold text-primary">
            {workspaceName}
          </p>
          <p className="text-label-sm text-muted-foreground">Creator Studio</p>
        </div>
        <button
          aria-controls="mobile-sidebar"
          aria-expanded={isOpen}
          aria-label="Open navigation"
          className="rounded-md p-2 text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <Menu aria-hidden="true" size={22} />
        </button>
      </header>

      <aside className="sticky top-0 hidden h-dvh w-sidebar shrink-0 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-inverse-surface/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <aside
            className="relative flex h-dvh w-sidebar max-w-[calc(100vw-2rem)] flex-col bg-card shadow-card"
            id="mobile-sidebar"
          >
            <button
              aria-label="Close navigation"
              className="absolute right-4 top-4 rounded-md p-2 text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
