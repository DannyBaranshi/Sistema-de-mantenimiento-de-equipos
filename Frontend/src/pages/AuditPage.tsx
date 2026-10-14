import { Fragment, useState } from "react";
import { useAuditLogs } from "../hooks/useAudit";
import { useUsers } from "../hooks/useUsers";
import { getApiErrorMessage } from "../lib/errors";

const ACTIONS = [
  "Create",
  "Update",
  "Delete",
  "Login",
  "LoginFailed",
  "LoginLockedOut",
  "Logout",
  "PasswordChanged",
  "PasswordReset",
];

// Entidades y acciones tal como las guarda el backend (AuditSaveChangesInterceptor / AuthService).
const ENTITY_TYPES = [
  "User",
  "Equipment",
  "Assignment",
  "EquipmentComponent",
  "Incident",
  "Maintenance",
  "SparePart",
  "MaintenanceSparePart",
];

function formatDetails(details?: string | null): string {
  if (!details) return "—";
  try {
    return JSON.stringify(JSON.parse(details), null, 2);
  } catch {
    return details;
  }
}

export default function AuditPage() {
  const [userId, setUserId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [action, setAction] = useState("");
  const [take, setTake] = useState(100);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: users } = useUsers();
  const { data, isLoading, error, refetch, isFetching } = useAuditLogs({
    userId: userId || undefined,
    entityType: entityType || undefined,
    entityId: entityId.trim() || undefined,
    action: action || undefined,
    take,
  });

  const userName = (id?: string | null) =>
    id ? users?.find((u) => u.id === id)?.fullName ?? id.slice(0, 8) : "Sistema / anónimo";

  return (
    <div className="space-y-4 p-8">
      <div>
        <h1 className="text-xl font-semibold">Auditoría</h1>
        <p className="text-sm text-gray-600">
          Registro de altas, cambios, borrados e inicios de sesión. Solo Administrador.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded border p-3 text-sm">
        <label className="block">
          <span className="text-xs text-gray-600">Usuario</span>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="input min-w-[180px]">
            <option value="">Todos</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Entidad</span>
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="input min-w-[160px]">
            <option value="">Todas</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Acción</span>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="input w-44">
            <option value="">Todas</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Id de entidad</span>
          <input value={entityId} onChange={(e) => setEntityId(e.target.value)} className="input w-64" />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Cantidad</span>
          <select value={take} onChange={(e) => setTake(Number(e.target.value))} className="input w-24">
            {[50, 100, 250, 500].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {isFetching ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {isLoading && <p>Cargando auditoría...</p>}
      {error && <p className="text-red-600">{getApiErrorMessage(error, "Error al cargar la auditoría.")}</p>}

      {data && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Entidad</th>
              <th>IP</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((log) => (
              <Fragment key={log.id}>
                <tr className="border-b align-top">
                  <td className="py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{userName(log.userId)}</td>
                  <td>{log.action}</td>
                  <td>
                    {log.entityType}
                    {log.entityId && <span className="block text-xs text-gray-500">{log.entityId}</span>}
                  </td>
                  <td>{log.ipAddress ?? "—"}</td>
                  <td className="text-right">
                    {log.details && (
                      <button
                        className="text-xs text-blue-600"
                        onClick={() => setOpenId(openId === log.id ? null : log.id)}
                      >
                        {openId === log.id ? "Ocultar" : "Detalle"}
                      </button>
                    )}
                  </td>
                </tr>
                {openId === log.id && (
                  <tr className="border-b bg-gray-50">
                    <td colSpan={6} className="p-3">
                      <pre className="overflow-x-auto text-xs whitespace-pre-wrap">{formatDetails(log.details)}</pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  No hay eventos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
