import { api } from "./api";
import type { AuditFilters, AuditLog } from "../types/audit";

export async function getAuditLogs(filters: AuditFilters = {}): Promise<AuditLog[]> {
  const params: Record<string, string | number> = {};
  if (filters.userId) params.userId = filters.userId;
  if (filters.entityType) params.entityType = filters.entityType;
  if (filters.entityId) params.entityId = filters.entityId;
  if (filters.action) params.action = filters.action;
  params.take = filters.take ?? 100;
  const res = await api.get<AuditLog[]>("/audit", { params });
  return res.data;
}
