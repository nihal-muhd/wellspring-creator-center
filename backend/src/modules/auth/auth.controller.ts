import type { NextFunction, Request, Response } from "express";

import { createAccessToken } from "../../lib/auth-token";
import { loginSchema, signupSchema } from "./auth.schema";
import {
  getAuthenticatedUser,
  login,
  signup,
} from "./auth.service";

const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = signupSchema.parse(req.body);
    const result = await signup(input);
    const accessToken = createAccessToken({
      userId: result.user.id,
      creatorId: result.creator.id,
      email: result.user.email,
    });

    setAccessTokenCookie(res, accessToken);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input);
    const accessToken = createAccessToken({
      userId: result.user.id,
      creatorId: result.user.creatorId,
      email: result.user.email,
    });

    setAccessTokenCookie(res, accessToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      res.status(401).json({
        success: false,
        error: "Unauthorized.",
      });
      return;
    }

    const result = await getAuthenticatedUser(
      authenticatedUser.userId,
      authenticatedUser.creatorId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
