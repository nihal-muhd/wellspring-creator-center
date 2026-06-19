import { Router } from "express";

import { listProgramSessionsController } from "./sessions.controller";

export const sessionsRouter = Router({ mergeParams: true });

sessionsRouter.get("/", listProgramSessionsController);
