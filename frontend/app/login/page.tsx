import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Wellspring creator workspace.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to continue managing your creator workspace."
      footerPrompt="New to Wellspring?"
      footerLinkHref="/signup"
      footerLinkLabel="Create an account"
    >
      <LoginForm />
    </AuthLayout>
  );
}
