import { updateNotifications } from "@/service/notification.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id}:{id:string}) => {
            return updateNotifications({id});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export default useNotificationRead;