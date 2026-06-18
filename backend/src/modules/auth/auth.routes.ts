import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import {
  loginController,
  logoutController,
  meController,
  signupController,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", authMiddleware, meController);
