export type SignupField = "workspaceName" | "fullName" | "email" | "password";

export type SignupValues = Record<SignupField, string>;

export type SignupFieldErrors = Partial<Record<SignupField, string>>;

export type SignupApiErrorResponse = {
  success: false;
  error: string;
};

export type LoginField = "email" | "password";

export type LoginValues = Record<LoginField, string>;

export type LoginFieldErrors = Partial<Record<LoginField, string>>;

export type AuthApiErrorResponse = {
  success: false;
  error: string;
};

export type AuthSession = {
  creator: {
    id: string;
    name: string;
    brandName: string | null;
  };
  user: {
    id: string;
    creatorId: string;
    email: string;
    role: "OWNER" | "ADMIN";
  };
};

export type AuthSessionResponse = {
  success: true;
  data: AuthSession;
};
