import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your workspace",
  description: "Create your Wellspring creator workspace.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Welcome to Wellspring"
      description="Enter your details to create your private creator workspace."
      footerPrompt="Already have an account?"
      footerLinkHref="/login"
      footerLinkLabel="Log in"
    >
      <SignupForm />
    </AuthLayout>
  );
}
