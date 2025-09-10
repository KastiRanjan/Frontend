import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePortalCredential } from "@/service/client.service";
import { message } from "antd";

export const useDeletePortalCredential = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) => 
      deletePortalCredential(clientId, credentialId),
    onSuccess: () => {
      message.success("Portal credential deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["portal-credentials", clientId] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to delete portal credential");
    }
  });
};
