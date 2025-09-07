import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBilling } from "../../service/billing.service";

export const useCreateBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBilling,
    onSuccess: () => {
      // Invalidate and refetch billings list
      queryClient.invalidateQueries({ queryKey: ["billings"] });
    },
  });
};
