import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getAuthSession } from "@/lib/auth/session";

type PublicAuthLayoutProps = {
  children: ReactNode;
};

export default async function PublicAuthLayout({
  children,
}: PublicAuthLayoutProps) {
  const session = await getAuthSession();

  if (session) {
    redirect("/programs");
  }

  return children;
}
