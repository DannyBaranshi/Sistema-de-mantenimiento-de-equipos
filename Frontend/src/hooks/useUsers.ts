import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services/usersServices";

// /users es solo para Administrador: los demás roles deben pasar enabled=false
// para no disparar un 403 innecesario.
export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled,
  });
}
