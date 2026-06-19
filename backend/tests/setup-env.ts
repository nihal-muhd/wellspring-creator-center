import "dotenv/config";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ||= "phase-8-test-jwt-secret";
process.env.AWS_REGION ||= "ap-south-1";
process.env.AWS_S3_BUCKET_NAME ||= "wellspring-phase-8-test";
process.env.AWS_S3_PUBLIC_BASE_URL ||=
  "https://wellspring-phase-8-test.s3.ap-south-1.amazonaws.com";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required for the Phase 8 integration tests.",
  );
}
