export type ProgramSummary = {
  id: string;
  title: string;
  description: string;
  sessionCount: number;
  coverImageUrl?: string;
  coverPosition?: "center" | "top" | "bottom";
};
