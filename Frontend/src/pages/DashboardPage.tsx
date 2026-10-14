import { useState } from "react";
import { AlertTriangle, Clock, Package, Wrench } from "lucide-react";
import { useAuth } from "../context/authContext";
import {
  useEquipmentSummary,
  useOpenIncidents,
  useUpcomingMaintenances,
} from "../hooks/useDashboard";
import DashboardCard from "../components/DashboardCard";
import DashboardChart from "../components/DashboardChart";
import { INCIDENT_STATUS_LABEL, type IncidentStatus } from "../types/incident";

const RANGES = [7, 15, 30, 60, 90];

export default function DashboardPage() {
  const { fullName, role } = useAuth();
  const [daysAhead, setDaysAhead] = useState(30);
  const summary = useEquipmentSummary();
  const incidents = useOpenIncidents();
  const maintenances = useUpcomingMaintenances(daysAhead);

  if (summary.isLoading || incidents.isLoading || maintenances.isLoading) {
    return <p className="p-8 text-gray-500">Cargando dashboard...</p>;
  }

  if (summary.error || incidents.error || maintenances.error) {
    return <p className="p-8 text-red-600">Error al cargar el dashboard.</p>;
  }

  const overdue = maintenances.data?.filter((m) => m.isOverdue).length ?? 0;

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Bienvenido, {fullName} · <span className="uppercase">{role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total de equipos" value={summary.data?.total ?? 0} icon={<Package size={20} />} accent="blue" />
        <DashboardCard title="Disponibles" value={summary.data?.available ?? 0} icon={<Package size={20} />} accent="green" />
        <DashboardCard title="En mantenimiento" value={summary.data?.underMaintenance ?? 0} icon={<Wrench size={20} />} accent="yellow" />
        <DashboardCard title="Incidencias abiertas" value={incidents.data?.length ?? 0} icon={<AlertTriangle size={20} />} accent="red" />
      </div>

      {summary.data && <DashboardChart data={summary.data} />}

      <div className="rounded-xl border p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-500" />
          <h2 className="text-lg font-semibold">Incidencias abiertas</h2>
        </div>
        {incidents.data && incidents.data.length > 0 ? (
          <div className="space-y-2">
            {incidents.data.map((incident) => (
              <div
                key={incident.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  incident.isUrgent ? "border-red-300 bg-red-50" : "bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{incident.equipmentInternalCode}</p>
                  <p className="text-xs text-gray-600">{incident.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${incident.isUrgent ? "text-red-600" : "text-gray-600"}`}>
                    {incident.daysOpen} día(s){incident.isUrgent && " · Urgente"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {INCIDENT_STATUS_LABEL[incident.status as IncidentStatus] ?? incident.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay incidencias abiertas.</p>
        )}
      </div>

      <div className="rounded-xl border p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-yellow-600" />
            <h2 className="text-lg font-semibold">Próximos mantenimientos</h2>
            {overdue > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {overdue} vencido(s)
              </span>
            )}
          </div>
          <label className="text-xs text-gray-600">
            Ventana:{" "}
            <select
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="rounded border px-2 py-1"
            >
              {RANGES.map((d) => (
                <option key={d} value={d}>
                  {d} días
                </option>
              ))}
            </select>
          </label>
        </div>
        {maintenances.data && maintenances.data.length > 0 ? (
          <div className="space-y-2">
            {maintenances.data.map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  m.isOverdue
                    ? "border-red-300 bg-red-50"
                    : m.daysUntil <= 7
                    ? "border-yellow-300 bg-yellow-50"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.equipmentInternalCode}</p>
                  <p className="text-xs text-gray-600">Técnico: {m.technicianName}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-medium ${
                      m.isOverdue ? "text-red-600" : m.daysUntil <= 7 ? "text-yellow-700" : "text-gray-600"
                    }`}
                  >
                    {m.isOverdue
                      ? `Vencido hace ${Math.abs(m.daysUntil)} día(s)`
                      : m.daysUntil === 0
                      ? "Hoy"
                      : `En ${m.daysUntil} día(s)`}
                  </p>
                  <p className="text-xs text-gray-500">{m.nextMaintenanceDate}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay mantenimientos próximos en {daysAhead} días.</p>
        )}
      </div>
    </div>
  );
}
