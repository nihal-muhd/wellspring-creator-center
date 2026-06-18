"use client";

import { SignupField } from "@/components/auth/SignupField";
import { SignupPasswordField } from "@/components/auth/SignupPasswordField";
import { useSignupForm } from "@/hooks/useSignupForm";

export function SignupForm() {
  const {
    clearFieldError,
    fieldErrors,
    formError,
    handleSubmit,
    isSubmitting,
  } = useSignupForm();

  return (
    <form
      className="space-y-3 sm:space-y-4"
      onSubmit={handleSubmit}
      noValidate
    >
      {formError ? (
        <div
          role="alert"
          className="rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
        >
          {formError}
        </div>
      ) : null}

      <SignupField
        name="workspaceName"
        label="Workspace name"
        type="text"
        autoComplete="organization"
        placeholder="e.g. Lumina Wellness"
        required
        error={fieldErrors.workspaceName}
        onValueChange={() => clearFieldError("workspaceName")}
      />

      <SignupField
        name="fullName"
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="e.g. Sarah Chen"
        required
        error={fieldErrors.fullName}
        onValueChange={() => clearFieldError("fullName")}
      />

      <SignupField
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="e.g. sarah@creator.com"
        required
        error={fieldErrors.email}
        onValueChange={() => clearFieldError("email")}
      />

      <SignupPasswordField
        error={fieldErrors.password}
        onValueChange={() => clearFieldError("password")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 w-full rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2 sm:py-3"
      >
        {isSubmitting ? "Creating workspace..." : "Create workspace"}
      </button>
    </form>
  );
}
