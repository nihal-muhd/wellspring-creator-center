"use client";

import { useState } from "react";

import { signupInputClassName } from "@/components/auth/SignupField";

type SignupPasswordFieldProps = {
  error?: string;
  onValueChange: () => void;
};

export function SignupPasswordField({
  error,
  onValueChange,
}: SignupPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = "password-error";

  return (
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
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={onValueChange}
          className={`${signupInputClassName} pr-20`}
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

      {error ? (
        <p id={errorId} className="text-label-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
