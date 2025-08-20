import { createUserDetail } from "@/service/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useCreateUserDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, query }: any) => {
      return createUserDetail({ id, payload, query });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Custom onSuccess can be passed in mutate options
    },
    onError: () => {
      // Custom onError can be passed in mutate options
    },
  });
};
