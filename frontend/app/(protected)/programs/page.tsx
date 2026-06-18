import type { Metadata } from "next";

import { ProgramsPageContent } from "@/components/programs/ProgramsPageContent";

export const metadata: Metadata = {
  title: "Programs",
  description: "Manage your Wellspring programs.",
};

export default function ProgramsPage() {
  return <ProgramsPageContent />;
}
