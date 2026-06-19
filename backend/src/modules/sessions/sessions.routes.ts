import { Router } from "express";

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
sessionsRouter.post("/reorder", reorderSessionsController);
sessionResourceRouter.patch("/:sessionId", updateSessionController);
sessionResourceRouter.delete("/:sessionId", deleteSessionController);
