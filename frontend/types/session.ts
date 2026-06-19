export type SessionMediaType = "AUDIO" | "VIDEO";

export type SessionSummary = {
  id: string;
  programId: string;
  title: string;
  duration: number;
  position: number;
  instructorName?: string;
  tags: string[];
  mediaType?: SessionMediaType;
  mediaUrl?: string;
  mediaKey?: string;
  thumbnailUrl?: string;
};

export type SessionApiRecord = {
  id: string;
  programId: string;
  title: string;
  duration: number;
  position: number;
  instructorName: string | null;
  tags: string[];
  mediaType: SessionMediaType | null;
  mediaUrl: string | null;
  mediaKey: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
