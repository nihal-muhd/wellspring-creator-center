import {
  PrismaClient,
  MediaType,
  UserRole,
} from "../src/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.auditLog.deleteMany();
  await prisma.bulkImport.deleteMany();
  await prisma.session.deleteMany();
  await prisma.program.deleteMany();
  await prisma.user.deleteMany();
  await prisma.creator.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const creators = [
    {
      name: "Lumina Wellness",
      brandName: "Lumina Wellness Creator Studio",
      email: "lumina@example.com",
      programs: [
        {
          title: "30-Day Sleep Reset",
          description:
            "A comprehensive circadian rhythm optimization journey for high-performers and creative professionals.",
        },
        {
          title: "Beginner Yoga Foundations",
          description:
            "A practical introduction to yoga basics, movement, balance, and breathing.",
        },
        {
          title: "Morning Meditation Series",
          description:
            "Short guided meditation sessions to build a consistent morning routine.",
        },
      ],
    },
    {
      name: "Calm Path Studio",
      brandName: "Calm Path Creator Studio",
      email: "calm@example.com",
      programs: [
        {
          title: "Stress Relief Breathwork",
          description:
            "Breathing practices for reducing stress and improving emotional regulation.",
        },
        {
          title: "Mindful Movement Basics",
          description:
            "Gentle movement sessions for relaxation, mobility, and body awareness.",
        },
        {
          title: "Deep Focus Reset",
          description:
            "Audio sessions designed to improve focus, clarity, and deep work habits.",
        },
      ],
    },
  ];

  for (const creatorData of creators) {
    const creator = await prisma.creator.create({
      data: {
        name: creatorData.name,
        brandName: creatorData.brandName,
      },
    });

    const user = await prisma.user.create({
      data: {
        creatorId: creator.id,
        email: creatorData.email,
        passwordHash,
        role: UserRole.OWNER,
      },
    });

    for (const programData of creatorData.programs) {
      const program = await prisma.program.create({
        data: {
          creatorId: creator.id,
          title: programData.title,
          description: programData.description,
          coverImageUrl:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
        },
      });

      for (let i = 1; i <= 10; i++) {
        await prisma.session.create({
          data: {
            creatorId: creator.id,
            programId: program.id,
            title: `${program.title} - Session ${i}`,
            duration: 10 + i,
            position: i,
            instructorName: i % 2 === 0 ? "Dr. Sarah Chen" : "Marcus Thorne",
            tags:
              i % 2 === 0
                ? ["Mindfulness", "Meditation"]
                : ["Foundational", "Lifestyle"],
            mediaType: i % 2 === 0 ? MediaType.AUDIO : MediaType.VIDEO,
            mediaUrl: `https://example.com/media/${program.id}/session-${i}.mp4`,
            thumbnailUrl:
              "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          creatorId: creator.id,
          actorId: user.id,
          action: "PROGRAM_CREATED",
          targetEntity: "PROGRAM",
          targetId: program.id,
          metadata: {
            title: program.title,
            seeded: true,
          },
        },
      });
    }
  }

  console.log("Seed completed.");
  console.log("Demo users:");
  console.log("lumina@example.com / Password123!");
  console.log("calm@example.com / Password123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
