import { deleteTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteTaskGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: any) => {
            return deleteTaskGroup({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["taskGroup"] });
        },
    });
};
