import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editBilling } from "../../service/billing.service";

export const useEditBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editBilling,
    onSuccess: () => {
      // Invalidate and refetch billings list
      queryClient.invalidateQueries({ queryKey: ["billings"] });
    },
  });
};
