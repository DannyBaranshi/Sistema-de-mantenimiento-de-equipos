import { useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import {
  downloadEquipmentsReport,
  downloadMaintenancesReport,
  downloadCostsReport,
} from "../services/reportServices";
import type { ReportFilters, ReportFormat } from "../types/report";
import { EQUIPMENT_STATUS_LABEL } from "../types/equipment";
import { MAINTENANCE_STATUS_LABEL, MAINTENANCE_TYPE_LABEL } from "../types/maintenance";
import { useAuth } from "../context/authContext";
import { useUsers } from "../hooks/useUsers";

type ReportFn = (filters: ReportFilters, format: ReportFormat) => Promise<void>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function ReportCard({
  title,
  description,
  reportKey,
  reportFn,
  filters,
  loading,
  error,
  onDownload,
  children,
}: {
  title: string;
  description: string;
  reportKey: string;
  reportFn: ReportFn;
  filters: ReportFilters;
  loading: string | null;
  error?: string;
  onDownload: (key: string, fn: ReportFn, filters: ReportFilters, format: ReportFormat) => void;
  children: React.ReactNode;
}) {
  const busy = loading !== null;
  return (
    <div className="space-y-3 rounded-xl border p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex flex-wrap items-end gap-3 text-sm">{children}</div>
      <div className="flex gap-2">
        <button
          onClick={() => onDownload(reportKey, reportFn, filters, "pdf")}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <FileDown size={16} />
          {loading === `${reportKey}-pdf` ? "Generando..." : "Descargar PDF"}
        </button>
        <button
          onClick={() => onDownload(reportKey, reportFn, filters, "excel")}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          <FileSpreadsheet size={16} />
          {loading === `${reportKey}-excel` ? "Generando..." : "Descargar Excel"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const { role } = useAuth();
  const isAdmin = role === "Administrador";
  // El backend solo deja listar usuarios al Administrador
  const { data: users } = useUsers(isAdmin);
  const technicians = (users ?? []).filter((u) => u.role === "Técnico" || u.role === "Administrador");

  // Rango de fechas común a los tres reportes
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Filtros propios de cada reporte (el backend interpreta "type" distinto en cada uno)
  const [eqType, setEqType] = useState("");
  const [eqStatus, setEqStatus] = useState("");
  const [mType, setMType] = useState("");
  const [mStatus, setMStatus] = useState("");
  const [mTech, setMTech] = useState("");

  const [loading, setLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dateError = from && to && from > to ? "La fecha 'Desde' no puede ser posterior a 'Hasta'." : "";

  async function handleDownload(
    key: string,
    fn: ReportFn,
    filters: ReportFilters,
    format: ReportFormat
  ) {
    setErrors((e) => ({ ...e, [key]: "" }));
    if (dateError) {
      setErrors((e) => ({ ...e, [key]: dateError }));
      return;
    }
    setLoading(`${key}-${format}`);
    try {
      await fn({ ...filters, from: from || undefined, to: to || undefined }, format);
    } catch {
      setErrors((e) => ({ ...e, [key]: "No se pudo generar el reporte. Intenta de nuevo." }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <p className="text-sm text-gray-600">Reportes gerenciales filtrables y exportables a PDF o Excel.</p>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-3 text-lg font-semibold">Rango de fechas (todos los reportes)</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Field label="Desde">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          </Field>
          <Field label="Hasta">
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          </Field>
        </div>
        {dateError && <p className="mt-2 text-sm text-red-600">{dateError}</p>}
      </div>

      <ReportCard
        title="Reporte de Equipos"
        description="Inventario de equipos con su estado y asignación actual."
        reportKey="equipos"
        reportFn={downloadEquipmentsReport}
        filters={{ type: eqType.trim() || undefined, status: eqStatus || undefined }}
        loading={loading}
        error={errors.equipos}
        onDownload={handleDownload}
      >
        <Field label="Tipo de equipo">
          <input value={eqType} onChange={(e) => setEqType(e.target.value)} placeholder="Laptop, Monitor..." className="input" />
        </Field>
        <Field label="Estado">
          <select value={eqStatus} onChange={(e) => setEqStatus(e.target.value)} className="input">
            <option value="">Todos</option>
            {Object.entries(EQUIPMENT_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </ReportCard>

      <ReportCard
        title="Reporte de Mantenimientos"
        description="Historial de mantenimientos preventivos y correctivos con costos."
        reportKey="mantenimientos"
        reportFn={downloadMaintenancesReport}
        filters={{ type: mType || undefined, status: mStatus || undefined, technicianId: mTech || undefined }}
        loading={loading}
        error={errors.mantenimientos}
        onDownload={handleDownload}
      >
        <Field label="Tipo de mantenimiento">
          <select value={mType} onChange={(e) => setMType(e.target.value)} className="input">
            <option value="">Todos</option>
            {Object.entries(MAINTENANCE_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado">
          <select value={mStatus} onChange={(e) => setMStatus(e.target.value)} className="input">
            <option value="">Todos</option>
            {Object.entries(MAINTENANCE_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        {isAdmin && (
          <Field label="Técnico">
            <select value={mTech} onChange={(e) => setMTech(e.target.value)} className="input min-w-[180px]">
              <option value="">Todos</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </Field>
        )}
      </ReportCard>

      <ReportCard
        title="Reporte de Costos"
        description="Costos acumulados por equipo: mano de obra, repuestos y otros."
        reportKey="costos"
        reportFn={downloadCostsReport}
        filters={{}}
        loading={loading}
        error={errors.costos}
        onDownload={handleDownload}
      >
        <p className="text-xs text-gray-500">Usa el rango de fechas de arriba.</p>
      </ReportCard>
    </div>
  );
}
