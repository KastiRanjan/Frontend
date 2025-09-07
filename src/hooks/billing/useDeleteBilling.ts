import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBilling } from "../../service/billing.service";

export const useDeleteBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBilling,
    onSuccess: () => {
      // Invalidate and refetch billings list
      queryClient.invalidateQueries({ queryKey: ["billings"] });
    },
  });
};
