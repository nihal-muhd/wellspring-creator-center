import type { Metadata } from "next";

import { ProgramDetailPageContent } from "@/components/programs/ProgramDetailPageContent";

type ProgramDetailPageProps = {
  params: Promise<{
    programId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Program Details",
  description: "Review a Wellspring program and its sessions.",
};

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { programId } = await params;

  return <ProgramDetailPageContent programId={programId} />;
}
