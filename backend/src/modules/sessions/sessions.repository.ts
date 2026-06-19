import { prisma } from "../../lib/prisma";

const sessionSelect = {
  id: true,
  programId: true,
  title: true,
  duration: true,
  position: true,
  instructorName: true,
  tags: true,
  mediaType: true,
  mediaUrl: true,
  mediaKey: true,
  thumbnailUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findProgramSessionsForCreator(
  programId: string,
  creatorId: string,
) {
  return prisma.session.findMany({
    where: {
      programId,
      creatorId,
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: sessionSelect,
  });
}
