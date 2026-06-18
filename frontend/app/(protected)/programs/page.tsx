import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs",
  description: "Manage your Wellspring programs.",
};

export default function ProgramsPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-gutter">
      <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-center shadow-card">
        <p className="text-label-sm uppercase tracking-widest text-primary">
          Workspace protected
        </p>
        <h1 className="mt-3 text-headline-md text-foreground">
          Programs workspace
        </h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          Your authenticated programs workspace is ready for the next phase.
        </p>
      </section>
    </main>
  );
}
