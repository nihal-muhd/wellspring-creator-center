import { UserRole } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

type CreateCreatorOwnerInput = {
  workspaceName: string;
  fullName: string;
  email: string;
  passwordHash: string;
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
}

export async function createCreatorOwner(input: CreateCreatorOwnerInput) {
  return prisma.$transaction(async (transaction) => {
    const creator = await transaction.creator.create({
      data: {
        name: input.fullName,
        brandName: input.workspaceName,
      },
      select: {
        id: true,
        name: true,
        brandName: true,
      },
    });

    const user = await transaction.user.create({
      data: {
        creatorId: creator.id,
        email: input.email,
        passwordHash: input.passwordHash,
        role: UserRole.OWNER,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return {
      creator,
      user,
    };
  });
}
