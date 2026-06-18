import { Router } from "express";

import {
  loginController,
  signupController,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
