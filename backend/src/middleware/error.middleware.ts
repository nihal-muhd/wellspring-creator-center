import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../lib/app-error";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: error.issues[0]?.message ?? "Invalid request data",
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  if (isUniqueConstraintError(error)) {
    res.status(409).json({
      success: false,
      error: "An account with this email already exists.",
    });
    return;
  }

  console.error("Unhandled request error", error);

  res.status(500).json({
    success: false,
    error: "Something went wrong. Please try again.",
  });
};
