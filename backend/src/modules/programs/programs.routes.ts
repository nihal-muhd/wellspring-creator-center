import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createProgramController,
  deleteProgramController,
  getProgramController,
  listProgramsController,
  updateProgramController,
} from "./programs.controller";
import { sessionsRouter } from "../sessions/sessions.routes";

export const programsRouter = Router();

programsRouter.use(authMiddleware);
programsRouter.get("/", listProgramsController);
programsRouter.post("/", createProgramController);
programsRouter.use("/:programId/sessions", sessionsRouter);
programsRouter.get("/:programId", getProgramController);
programsRouter.patch("/:programId", updateProgramController);
programsRouter.delete("/:programId", deleteProgramController);
