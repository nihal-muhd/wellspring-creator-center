"use client";

import { AxiosError } from "axios";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

type SignupField = "workspaceName" | "fullName" | "email" | "password";
type SignupFieldErrors = Partial<Record<SignupField, string>>;

type ApiErrorResponse = {
  success: false;
  error: string;
};

function validateSignup(values: Record<SignupField, string>) {
  const errors: SignupFieldErrors = {};

  if (values.workspaceName.trim().length < 2) {
    errors.workspaceName = "Enter a workspace name.";
  }

  if (values.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return "We could not create your workspace. Please try again.";
}

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const values: Record<SignupField, string> = {
      workspaceName: String(formData.get("workspaceName") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const validationErrors = validateSignup(values);

    setFieldErrors(validationErrors);
    setFormError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/signup", values);
      router.push("/programs");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(field: SignupField) {
    if (!fieldErrors[field]) {
      return;
    }

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  const inputClassName =
    "w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-label-md text-foreground outline-none transition-colors placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error-container sm:py-3 sm:text-body-md";

  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
        >
          {formError}
        </div>
      ) : null}

      <div className="space-y-1">
        <label
          htmlFor="workspaceName"
          className="block text-label-md text-foreground"
        >
          Workspace name
        </label>
        <input
          id="workspaceName"
          name="workspaceName"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Lumina Wellness"
          required
          aria-invalid={Boolean(fieldErrors.workspaceName)}
          aria-describedby={
            fieldErrors.workspaceName ? "workspaceName-error" : undefined
          }
          onChange={() => clearFieldError("workspaceName")}
          className={inputClassName}
        />
        {fieldErrors.workspaceName ? (
          <p id="workspaceName-error" className="text-label-sm text-error">
            {fieldErrors.workspaceName}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="fullName"
          className="block text-label-md text-foreground"
        >
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="e.g. Sarah Chen"
          required
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
          onChange={() => clearFieldError("fullName")}
          className={inputClassName}
        />
        {fieldErrors.fullName ? (
          <p id="fullName-error" className="text-label-sm text-error">
            {fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-label-md text-foreground">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. sarah@creator.com"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          onChange={() => clearFieldError("email")}
          className={inputClassName}
        />
        {fieldErrors.email ? (
          <p id="email-error" className="text-label-sm text-error">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-label-md text-foreground"
          >
            Password
          </label>
          <span className="text-label-sm font-medium text-muted-foreground">
            At least 8 characters
          </span>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            placeholder="Create a secure password"
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            onChange={() => clearFieldError("password")}
            className={`${inputClassName} pr-20`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((isVisible) => !isVisible)}
            className="absolute inset-y-0 right-3 my-auto h-fit rounded-sm px-2 py-1 text-label-sm font-semibold text-primary hover:bg-primary-fixed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-controls="password"
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {fieldErrors.password ? (
          <p id="password-error" className="text-label-sm text-error">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

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
