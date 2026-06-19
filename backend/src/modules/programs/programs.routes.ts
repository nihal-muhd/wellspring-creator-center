import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createProgramController,
  deleteProgramController,
  getProgramController,
  listProgramsController,
  updateProgramController,
} from "./programs.controller";

export const programsRouter = Router();

programsRouter.use(authMiddleware);
programsRouter.get("/", listProgramsController);
programsRouter.post("/", createProgramController);
programsRouter.get("/:programId", getProgramController);
programsRouter.patch("/:programId", updateProgramController);
programsRouter.delete("/:programId", deleteProgramController);
