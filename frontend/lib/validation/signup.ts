import type {
  SignupFieldErrors,
  SignupValues,
} from "@/types/auth";

export function getSignupValues(formData: FormData): SignupValues {
  return {
    workspaceName: String(formData.get("workspaceName") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export function validateSignup(values: SignupValues): SignupFieldErrors {
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
