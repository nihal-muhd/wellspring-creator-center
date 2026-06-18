import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  description: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  footerPrompt: string;
  title: string;
};

export function AuthLayout({
  children,
  description,
  footerLinkHref,
  footerLinkLabel,
  footerPrompt,
  title,
}: AuthLayoutProps) {
  return (
    <main className="grid h-dvh overflow-hidden bg-background lg:grid-cols-2">
      <section className="flex h-dvh min-h-0 flex-col overflow-hidden px-6 py-4 sm:px-10 sm:py-6 lg:px-14 lg:py-8 xl:px-20">
        <header>
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Wellspring creator studio"
          >
            <span
              className="grid size-10 place-items-center rounded-md bg-primary text-lg font-bold text-on-primary"
              aria-hidden="true"
            >
              W
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-primary">
                Wellspring
              </span>
              <span className="block text-label-sm font-medium text-muted-foreground">
                Creator Studio
              </span>
            </span>
          </Link>
        </header>

        <div className="flex min-h-0 flex-1 items-center py-3 sm:py-5">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-headline-lg text-foreground">{title}</h1>
              <p className="mt-2 text-label-md text-muted-foreground sm:text-body-md">
                {description}
              </p>
            </div>

            {children}

            <div className="mt-4 border-t border-border pt-4 text-center text-label-md text-muted-foreground sm:mt-6 sm:pt-5">
              {footerPrompt}{" "}
              <Link
                href={footerLinkHref}
                className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {footerLinkLabel}
              </Link>
            </div>
          </div>
        </div>

        <footer className="hidden text-center text-label-sm font-medium text-muted-foreground sm:block lg:text-left">
          © 2026 Wellspring. A private studio for wellness creators.
        </footer>
      </section>

      <aside className="relative hidden h-dvh overflow-hidden bg-surface-container lg:block">
        <Image
          src="/screen.png"
          alt="A calm, sunlit wellness studio with a small plant"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/10" aria-hidden="true" />

        <div className="absolute inset-x-10 bottom-10 rounded-xl border border-on-primary/30 bg-inverse-surface/70 p-8 text-inverse-on-surface shadow-card backdrop-blur-md xl:inset-x-16 xl:bottom-14">
          <p className="text-label-sm uppercase tracking-widest text-inverse-primary">
            Your calm command center
          </p>
          <p className="mt-3 text-headline-md">
            Build thoughtful programs in a workspace designed to stay out of
            your way.
          </p>
          <p className="mt-4 text-label-md text-inverse-on-surface/80">
            Organize sessions, manage media, and keep every creator action
            accountable.
          </p>
        </div>
      </aside>
    </main>
  );
}
