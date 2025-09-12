import { createUser } from "@/service/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createUser(payload);
    },
    onSuccess: () => {
      // Invalidate all user-related queries to ensure table refresh
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Remove automatic navigation to allow modal usage
    },
  });
};
