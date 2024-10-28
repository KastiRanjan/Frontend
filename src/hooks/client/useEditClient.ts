import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editClient } from "../../service/client.service";
import { useNavigate } from "react-router-dom";

export const useEditClient = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editClient({ payload, id });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigate("/client");
    },
  });
};
