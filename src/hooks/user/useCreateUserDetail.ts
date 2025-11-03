import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserDetail } from "@/service/user.service";

export const useCreateUserDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, query }: { id: string | undefined; payload: any; query: string }) => {
      return createUserDetail({ id, payload, query });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userDetails"] });
    },
  });
};
