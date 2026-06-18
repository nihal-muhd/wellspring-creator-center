import bcrypt from "bcrypt";

import { AppError } from "../../lib/app-error";
import {
  createCreatorOwner,
  findUserByEmail,
} from "./auth.repository";
import type { SignupInput } from "./auth.schema";

const PASSWORD_SALT_ROUNDS = 12;

export async function signup(input: SignupInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    PASSWORD_SALT_ROUNDS,
  );

  return createCreatorOwner({
    workspaceName: input.workspaceName,
    fullName: input.fullName,
    email: input.email,
    passwordHash,
  });
}
