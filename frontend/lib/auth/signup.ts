import { AxiosError } from "axios";

import { api } from "@/lib/api";

import type {
  SignupApiErrorResponse,
  SignupValues,
} from "@/types/auth";

const SIGNUP_FALLBACK_ERROR =
  "We could not create your workspace. Please try again.";

export async function createWorkspace(values: SignupValues): Promise<void> {
  await api.post("/auth/signup", values);
}

export function getSignupErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | SignupApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return SIGNUP_FALLBACK_ERROR;
}
