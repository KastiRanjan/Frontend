import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../../service/client.service";

export const useClient = (status?: string) => {
  return useQuery({
    queryKey: ["clients", status],
    queryFn: async () => {
      return fetchClients(status);
    },
  });
};
