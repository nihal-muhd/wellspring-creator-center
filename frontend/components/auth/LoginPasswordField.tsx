"use client";

import { useState } from "react";

import { signupInputClassName } from "@/components/auth/SignupField";

type LoginPasswordFieldProps = {
  error?: string;
  onValueChange: () => void;
};

export function LoginPasswordField({
  error,
  onValueChange,
}: LoginPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = "login-password-error";

  return (
    <div className="space-y-1">
      <label
        htmlFor="login-password"
        className="block text-label-md text-foreground"
      >
        Password
      </label>

      <div className="relative">
        <input
          id="login-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
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
          aria-controls="login-password"
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
