export type SignupField = "workspaceName" | "fullName" | "email" | "password";

export type SignupValues = Record<SignupField, string>;

export type SignupFieldErrors = Partial<Record<SignupField, string>>;

export type SignupApiErrorResponse = {
  success: false;
  error: string;
};
