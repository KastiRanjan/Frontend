import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../../service/client.service";

export const useClient = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      return fetchClients();
    },
    // enabled: !!page && !!limit,
  });
};
