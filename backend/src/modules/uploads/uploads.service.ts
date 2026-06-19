import crypto from "node:crypto";

import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { AppError } from "../../lib/app-error";
import {
  getS3BucketName,
  getS3PublicBaseUrl,
  s3Client,
} from "../../lib/s3";
import type {
  PresignReadInput,
  PresignUploadInput,
} from "./uploads.schema";
import {
  createUploadAuditLog,
  findUploadProgramForCreator,
  isFileKeyOwnedByCreator,
} from "./uploads.repository";

const programImageTypes = new Map<string, readonly string[]>([
  ["image/jpeg", ["jpg", "jpeg"]],
  ["image/png", ["png"]],
  ["image/webp", ["webp"]],
]);
const sessionMediaTypes = new Map<string, readonly string[]>([
  ["audio/mpeg", ["mp3"]],
  ["audio/mp4", ["m4a", "mp4"]],
  ["audio/x-m4a", ["m4a"]],
  ["audio/wav", ["wav"]],
  ["audio/x-wav", ["wav"]],
  ["audio/webm", ["webm"]],
  ["audio/ogg", ["ogg", "oga"]],
  ["video/mp4", ["mp4", "m4v"]],
  ["video/webm", ["webm"]],
  ["video/quicktime", ["mov"]],
  ["video/ogg", ["ogv", "ogg"]],
]);
const programImageMaxSize = 10 * 1024 * 1024;
const sessionMediaMaxSize = 100 * 1024 * 1024;
const expiresIn = 300;
const readExpiresIn = 600;

function getValidatedExtension(input: PresignUploadInput): string {
  const allowedTypes =
    input.uploadType === "PROGRAM_IMAGE"
      ? programImageTypes
      : sessionMediaTypes;
  const allowedExtensions = allowedTypes.get(input.contentType.toLowerCase());
  const maximumSize =
    input.uploadType === "PROGRAM_IMAGE"
      ? programImageMaxSize
      : sessionMediaMaxSize;

  if (!allowedExtensions) {
    throw new AppError(
      input.uploadType === "PROGRAM_IMAGE"
        ? "Choose a JPEG, PNG, or WebP image."
        : "Choose a supported audio or video file.",
      400,
    );
  }

  if (input.fileSize > maximumSize) {
    throw new AppError(
      input.uploadType === "PROGRAM_IMAGE"
        ? "Choose an image smaller than 10 MB."
        : "Choose a media file smaller than 100 MB.",
      400,
    );
  }

  const suppliedExtension = input.fileName.split(".").pop()?.toLowerCase();

  if (
    !suppliedExtension ||
    !allowedExtensions.includes(suppliedExtension)
  ) {
    throw new AppError(
      "The file extension does not match its content type.",
      400,
    );
  }

  return allowedExtensions[0];
}

export async function createPresignedUpload(
  creatorId: string,
  actorId: string,
  input: PresignUploadInput,
) {
  const program = await findUploadProgramForCreator(
    input.programId,
    creatorId,
  );

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  const extension = getValidatedExtension(input);
  const directory =
    input.uploadType === "PROGRAM_IMAGE" ? "images" : "sessions";
  const fileKey = `creators/${creatorId}/programs/${input.programId}/${directory}/${crypto.randomUUID()}.${extension}`;
  const command = new PutObjectCommand({
    Bucket: getS3BucketName(),
    Key: fileKey,
    ContentType: input.contentType,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn,
  });
  const fileUrl = `${getS3PublicBaseUrl()}/${fileKey}`;

  await createUploadAuditLog({
    creatorId,
    actorId,
    programId: input.programId,
    uploadType: input.uploadType,
    fileKey,
    contentType: input.contentType,
    fileSize: input.fileSize,
  });

  return {
    uploadUrl,
    fileUrl,
    fileKey,
    expiresIn,
  };
}

export async function createPresignedReadUrl(
  creatorId: string,
  input: PresignReadInput,
) {
  const creatorPrefix = `creators/${creatorId}/`;

  if (!input.fileKey.startsWith(creatorPrefix)) {
    throw new AppError("File not found.", 404);
  }

  const isOwned = await isFileKeyOwnedByCreator(
    input.fileKey,
    creatorId,
  );

  if (!isOwned) {
    throw new AppError("File not found.", 404);
  }

  const readUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: getS3BucketName(),
      Key: input.fileKey,
    }),
    {
      expiresIn: readExpiresIn,
    },
  );

  return {
    readUrl,
    expiresIn: readExpiresIn,
  };
}
