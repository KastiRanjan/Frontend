import { updateNotifications } from "@/service/notification.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, userId}:{id:string, userId:string}) => {
            return updateNotifications({id, userId});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export default useNotificationRead;