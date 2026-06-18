import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "7d";

type AccessTokenPayload = {
  userId: string;
  creatorId: string;
  email: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function createAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}
