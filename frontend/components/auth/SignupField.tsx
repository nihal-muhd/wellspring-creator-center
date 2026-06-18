import type { ComponentPropsWithoutRef } from "react";

import type { SignupField as SignupFieldName } from "@/types/auth";

export const signupInputClassName =
  "w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-label-md text-foreground outline-none transition-colors placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error-container sm:py-3 sm:text-body-md";

type SignupFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "id" | "name" | "onChange"
> & {
  error?: string;
  label: string;
  name: SignupFieldName;
  onValueChange: () => void;
};

export function SignupField({
  error,
  label,
  name,
  onValueChange,
  ...inputProps
}: SignupFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-label-md text-foreground"
      >
        {label}
      </label>
      <input
        {...inputProps}
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={onValueChange}
        className={signupInputClassName}
      />
      {error ? (
        <p id={errorId} className="text-label-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
