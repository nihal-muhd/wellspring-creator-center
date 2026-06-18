import type { NextFunction, Request, Response } from "express";

import { createAccessToken } from "../../lib/auth-token";
import { signupSchema } from "./auth.schema";
import { signup } from "./auth.service";

const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

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

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
