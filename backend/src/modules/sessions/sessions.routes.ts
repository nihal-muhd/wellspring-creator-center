import { Router } from "express";

import {
  createSessionController,
  listProgramSessionsController,
  updateSessionController,
} from "./sessions.controller";

export const sessionsRouter = Router({ mergeParams: true });
export const sessionResourceRouter = Router();

sessionsRouter.get("/", listProgramSessionsController);
sessionsRouter.post("/", createSessionController);
sessionResourceRouter.patch("/:sessionId", updateSessionController);
