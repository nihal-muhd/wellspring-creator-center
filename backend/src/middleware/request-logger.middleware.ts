import crypto from "node:crypto";

import type { Request, Response } from "express";
import type pino from "pino";
import pinoHttp from "pino-http";

function getRequestId(req: Request, res: Response): string {
  const suppliedRequestId = req.get("x-request-id")?.trim();
  const requestId = suppliedRequestId || crypto.randomUUID();

  res.setHeader("x-request-id", requestId);

  return requestId;
}

function getRequestContext(req: Request): {
  request_id: string;
  tenant_id: string | null;
} {
  return {
    request_id: String(req.id),
    tenant_id: req.user?.creatorId ?? null,
  };
}

export function createRequestLogger(stream?: pino.DestinationStream) {
  return pinoHttp<Request, Response>(
    {
      level: process.env.LOG_LEVEL || "info",
      genReqId: getRequestId,
      customAttributeKeys: {
        reqId: "request_id",
      },
      customLogLevel(_req, res, error) {
        if (error || res.statusCode >= 500) {
          return "error";
        }

        if (res.statusCode >= 400) {
          return "warn";
        }

        return "info";
      },
      customSuccessObject(req, _res, value) {
        return {
          ...value,
          ...getRequestContext(req),
        };
      },
      customErrorObject(req, _res, error, value) {
        return {
          ...value,
          ...getRequestContext(req),
          err: error,
        };
      },
      redact: {
        paths: ["req.headers.cookie", "req.headers.authorization"],
        censor: "[Redacted]",
      },
    },
    stream,
  );
}
