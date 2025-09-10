import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePortalCredential } from "@/service/client.service";
import { message } from "antd";

export const useUpdatePortalCredential = (clientId: string, credentialId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => 
      updatePortalCredential(clientId, credentialId, payload),
    onSuccess: () => {
      message.success("Portal credential updated successfully");
      queryClient.invalidateQueries({ queryKey: ["portal-credentials", clientId] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to update portal credential");
    }
  });
};
