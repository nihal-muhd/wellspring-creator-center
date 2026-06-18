import type { AccessTokenPayload } from "../lib/auth-token";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
