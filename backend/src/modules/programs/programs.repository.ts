import { prisma } from "../../lib/prisma";
import type {
  CreateProgramInput,
  UpdateProgramInput,
} from "./programs.schema";

const programSelect = {
  id: true,
  title: true,
  description: true,
  coverImageUrl: true,
  coverImageKey: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      sessions: true,
    },
  },
} as const;

export async function findProgramsForCreator(creatorId: string) {
  return prisma.program.findMany({
    where: {
      creatorId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: programSelect,
  });
}

export async function findProgramByIdForCreator(
  programId: string,
  creatorId: string,
) {
  return prisma.program.findFirst({
    where: {
      id: programId,
      creatorId,
    },
    select: programSelect,
  });
}

export async function createProgramForCreator(
  creatorId: string,
  input: CreateProgramInput,
) {
  return prisma.program.create({
    data: {
      creatorId,
      title: input.title,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
      coverImageKey: input.coverImageKey,
    },
    select: programSelect,
  });
}

export async function updateProgramForCreator(
  programId: string,
  creatorId: string,
  input: UpdateProgramInput,
) {
  const result = await prisma.program.updateMany({
    where: {
      id: programId,
      creatorId,
    },
    data: input,
  });

  if (result.count === 0) {
    return null;
  }

  return findProgramByIdForCreator(programId, creatorId);
}

export async function deleteProgramForCreator(
  programId: string,
  creatorId: string,
) {
  return prisma.program.deleteMany({
    where: {
      id: programId,
      creatorId,
    },
  });
}
