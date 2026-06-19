import type { Metadata } from "next";

import { AuditLogsPageContent } from "@/components/audit-logs/AuditLogsPageContent";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Review administrative activity in your Wellspring workspace.",
};

export default function AuditLogsPage() {
  return <AuditLogsPageContent />;
}
