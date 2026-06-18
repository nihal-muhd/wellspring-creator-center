import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { getAuthSession } from "@/lib/auth/session";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const workspaceName = session.creator.brandName ?? session.creator.name;

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar workspaceName={workspaceName} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
