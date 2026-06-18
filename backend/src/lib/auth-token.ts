import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "7d";

export type AccessTokenPayload = {
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

function isAccessTokenPayload(
  payload: string | jwt.JwtPayload,
): payload is jwt.JwtPayload & AccessTokenPayload {
  return (
    typeof payload !== "string" &&
    typeof payload.userId === "string" &&
    typeof payload.creatorId === "string" &&
    typeof payload.email === "string"
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, getJwtSecret());

  if (!isAccessTokenPayload(payload)) {
    throw new jwt.JsonWebTokenError("Invalid access token payload");
  }

  return {
    userId: payload.userId,
    creatorId: payload.creatorId,
    email: payload.email,
  };
}
