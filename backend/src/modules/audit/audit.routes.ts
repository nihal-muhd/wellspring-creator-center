import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { listAuditLogsController } from "./audit.controller";

export const auditRouter = Router();

auditRouter.use(authMiddleware);
auditRouter.get("/", listAuditLogsController);
