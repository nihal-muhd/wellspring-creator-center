import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/app-error";
import { verifyAccessToken } from "../lib/auth-token";

const ACCESS_TOKEN_COOKIE_NAME = "access_token";

function getCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex).trim();

    if (name === cookieName) {
      return cookie.slice(separatorIndex + 1).trim();
    }
  }

  return undefined;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const accessToken = getCookieValue(
    req.headers.cookie,
    ACCESS_TOKEN_COOKIE_NAME,
  );

  if (!accessToken) {
    next(new AppError("Unauthorized.", 401));
    return;
  }

  try {
    req.user = verifyAccessToken(accessToken);
    next();
  } catch {
    next(new AppError("Unauthorized.", 401));
  }
}
