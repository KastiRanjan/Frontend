import { useQuery } from "@tanstack/react-query";
import { fetchBillings } from "../../service/billing.service";

export const useBilling = (status?: string) => {
  return useQuery({
    queryKey: ["billings", status],
    queryFn: async () => {
      return fetchBillings(status);
    },
  });
};
