import type { LoginFieldErrors, LoginValues } from "@/types/auth";

export function getLoginValues(formData: FormData): LoginValues {
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export function validateLogin(values: LoginValues): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  }

  return errors;
}
