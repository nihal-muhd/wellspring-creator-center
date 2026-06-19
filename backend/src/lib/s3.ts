import {
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { AppError } from "./app-error";

function getRequiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AppError("File uploads are not configured.", 503);
  }

  return value;
}

export function getS3BucketName(): string {
  return getRequiredEnvironmentValue("AWS_S3_BUCKET_NAME");
}

export function getS3PublicBaseUrl(): string {
  return getRequiredEnvironmentValue("AWS_S3_PUBLIC_BASE_URL").replace(
    /\/+$/,
    "",
  );
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export async function deleteS3Object(fileKey: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: getS3BucketName(),
      Key: fileKey,
    }),
  );
}

export async function deleteS3ObjectsBestEffort(
  fileKeys: Array<string | null | undefined>,
): Promise<void> {
  const uniqueKeys = [
    ...new Set(fileKeys.filter((key): key is string => Boolean(key))),
  ];

  await Promise.all(
    uniqueKeys.map(async (fileKey) => {
      try {
        await deleteS3Object(fileKey);
      } catch (error) {
        console.error("S3 object cleanup failed", {
          fileKey,
          error,
        });
      }
    }),
  );
}

export function assertManagedS3File(
  creatorId: string,
  programId: string,
  directory: "images" | "sessions",
  fileUrl: string | null | undefined,
  fileKey: string | null | undefined,
): void {
  if (!fileUrl && !fileKey) {
    return;
  }

  if (!fileUrl || !fileKey) {
    throw new AppError("File URL and key must be provided together.", 400);
  }

  const expectedPrefix = `creators/${creatorId}/programs/${programId}/${directory}/`;
  const expectedUrl = `${getS3PublicBaseUrl()}/${fileKey}`;

  if (!fileKey.startsWith(expectedPrefix) || fileUrl !== expectedUrl) {
    throw new AppError("Invalid uploaded file reference.", 400);
  }
}
