import bcrypt from "bcrypt";

import { AppError } from "../../lib/app-error";
import {
  createCreatorOwner,
  findUserCredentialsByEmail,
  findUserByEmail,
} from "./auth.repository";
import type { LoginInput, SignupInput } from "./auth.schema";

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

export async function login(input: LoginInput) {
  const user = await findUserCredentialsByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  return {
    creator: user.creator,
    user: {
      id: user.id,
      creatorId: user.creatorId,
      email: user.email,
      role: user.role,
    },
  };
}
