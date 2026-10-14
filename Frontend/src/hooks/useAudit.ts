import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../services/auditServices";
import type { AuditFilters } from "../types/audit";

export function useAuditLogs(filters: AuditFilters) {
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: () => getAuditLogs(filters),
  });
}
