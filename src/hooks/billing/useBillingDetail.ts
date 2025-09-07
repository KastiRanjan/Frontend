import { useQuery } from "@tanstack/react-query";
import { fetchBillingById } from "../../service/billing.service";

export const useBillingDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["billingDetail", id],
    queryFn: async () => {
      return fetchBillingById({ id });
    },
    enabled: !!id,
  });
};
