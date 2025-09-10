import { useQuery } from "@tanstack/react-query";
import { fetchPortalCredentials } from "@/service/client.service";

export const usePortalCredentials = (clientId: string) => {
  return useQuery({
    queryKey: ["portal-credentials", clientId],
    queryFn: () => fetchPortalCredentials(clientId),
    enabled: !!clientId,
  });
};
