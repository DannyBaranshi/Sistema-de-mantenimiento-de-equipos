import { useQuery } from "@tanstack/react-query";
import {
  getEquipmentHistory,
  getMaintenancesByEquipment,
  getMaintenanceList,
} from "../services/maintenanceServices";
import { getSpareParts } from "../services/sparePartServices";

export function useMaintenancesByEquipment(equipmentId: string) {
  return useQuery({
    queryKey: ["maintenances", equipmentId],
    queryFn: () => getMaintenancesByEquipment(equipmentId),
    enabled: !!equipmentId,
  });
}

export function useSpareParts(includeInactive = false) {
  return useQuery({
    queryKey: ["spareparts", includeInactive],
    queryFn: () => getSpareParts(includeInactive),
  });
}

export function useAllMaintenances() {
  return useQuery({
    queryKey: ["maintenances", "all"],
    queryFn: getMaintenanceList,
  });
}

export function useEquipmentHistory(equipmentId: string) {
  return useQuery({
    queryKey: ["maintenances", "history", equipmentId],
    queryFn: () => getEquipmentHistory(equipmentId),
    enabled: !!equipmentId,
  });
}
