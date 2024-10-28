import { useQuery } from "@tanstack/react-query";
import { fetchClientById} from "@/service/client.service";

export const useClientById = ({ id }: { id: string }) => {
  return useQuery({

    queryKey: ["client", id],
    queryFn: async () => {
      return fetchClientById({ id });
    },
    enabled: !!id,
  });
};
