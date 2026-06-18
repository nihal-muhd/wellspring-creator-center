import { cookies } from "next/headers";

import type { AuthSession, AuthSessionResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as AuthSessionResponse;

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
