export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}

export interface AuditFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  take?: number;
}
