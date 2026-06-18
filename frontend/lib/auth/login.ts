import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type { AuthApiErrorResponse, LoginValues } from "@/types/auth";

const LOGIN_FALLBACK_ERROR =
  "We could not log you in. Check your details and try again.";

export async function login(values: LoginValues): Promise<void> {
  await api.post("/auth/login", values);
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | AuthApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return LOGIN_FALLBACK_ERROR;
}
