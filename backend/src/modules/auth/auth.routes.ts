import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import {
  loginController,
  meController,
  signupController,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.get("/me", authMiddleware, meController);
