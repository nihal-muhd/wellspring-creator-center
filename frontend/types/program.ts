export type ProgramSummary = {
  id: string;
  title: string;
  description: string;
  sessionCount: number;
  coverImageUrl?: string;
  coverImageKey?: string;
  coverPosition?: "center" | "top" | "bottom";
};

export type ProgramFormValues = {
  title: string;
  description: string;
  coverImageUrl?: string;
};

export type ProgramApiRecord = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sessions: number;
  };
};

export type ProgramApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ProgramApiErrorResponse = {
  success: false;
  error: string;
};

export type ProgramMutationInput = {
  title: string;
  description: string;
  coverImageUrl?: string | null;
  coverImageKey?: string | null;
};
