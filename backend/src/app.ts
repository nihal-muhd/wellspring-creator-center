import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorMiddleware } from "./middleware/error.middleware";
import { auditRouter } from "./modules/audit/audit.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { programsRouter } from "./modules/programs/programs.routes";
import { sessionResourceRouter } from "./modules/sessions/sessions.routes";
import { uploadsRouter } from "./modules/uploads/uploads.routes";
import { authMiddleware } from "./middleware/auth.middleware";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "wellspring-api",
    },
  });
});

app.use("/auth", authRouter);
app.use("/audit-logs", auditRouter);
app.use("/programs", programsRouter);
app.use("/sessions", authMiddleware, sessionResourceRouter);
app.use("/uploads", uploadsRouter);
app.use(errorMiddleware);
