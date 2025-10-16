import { markAllAsReadByType } from "@/service/notification.service";
import { NotificationType } from "@/types/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useMarkAllAsReadByType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, type }: { userId: string, type: NotificationType }) => {
            return markAllAsReadByType({ userId, type });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export default useMarkAllAsReadByType;
