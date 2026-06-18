import { redirect } from "next/navigation";
import type { ReactNode } from "react";

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

  return children;
}
