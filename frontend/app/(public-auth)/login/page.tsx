import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Wellspring creator workspace.",
};

type LoginPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const requestedReturnTo = (await searchParams).returnTo;
  const returnTo =
    typeof requestedReturnTo === "string" &&
    requestedReturnTo.startsWith("/") &&
    !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/programs";

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to continue managing your creator workspace."
      footerPrompt="New to Wellspring?"
      footerLinkHref="/signup"
      footerLinkLabel="Create an account"
    >
      <LoginForm returnTo={returnTo} />
    </AuthLayout>
  );
}
