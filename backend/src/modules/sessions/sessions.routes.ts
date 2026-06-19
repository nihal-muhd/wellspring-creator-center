import { Router } from "express";

import { importProgramSessionsController } from "../imports/imports.controller";
import { uploadSessionCsv } from "../imports/imports.middleware";
import {
  createSessionController,
  deleteSessionController,
  listProgramSessionsController,
  reorderSessionsController,
  updateSessionController,
} from "./sessions.controller";

export const sessionsRouter = Router({ mergeParams: true });
export const sessionResourceRouter = Router();

sessionsRouter.get("/", listProgramSessionsController);
sessionsRouter.post("/", createSessionController);
sessionsRouter.post(
  "/import",
  uploadSessionCsv,
  importProgramSessionsController,
);
sessionsRouter.post("/reorder", reorderSessionsController);
sessionResourceRouter.patch("/:sessionId", updateSessionController);
sessionResourceRouter.delete("/:sessionId", deleteSessionController);
