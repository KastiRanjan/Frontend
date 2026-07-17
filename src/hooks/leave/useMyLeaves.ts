import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as leaveService from "../../service/leave.service";

/** The authenticated user's own leave requests (GET /leave/my-leaves). */
export function useMyLeaves(status?: string) {
  return useQuery({
    queryKey: ["my-leaves", status],
    queryFn: () => leaveService.fetchUserLeaves(status),
  });
}

/**
 * Role-aware approval via the secure generic endpoint (PATCH /leave/:id/approve).
 * The approver identity is taken from the session on the server — never sent
 * from the client.
 */
export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notifyAdmins }: { id: string; notifyAdmins?: string[] }) =>
      leaveService.approveLeave(id, notifyAdmins),
    onSuccess: () => {
      ["leaves", "my-leaves", "pending-approvals", "leave-balances", "leaveBalances"].forEach(
        (k) => qc.invalidateQueries({ queryKey: [k] })
      );
    },
  });
}
