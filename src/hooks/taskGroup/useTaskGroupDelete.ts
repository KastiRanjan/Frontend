import { deleteTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useDeleteTaskGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: any) => {
            console.log('useDeleteTaskGroup mutationFn called with id:', id);
            return deleteTaskGroup({ id });
        },
        onSuccess: () => {
            console.log('Delete successful');
            message.success("Task group and associated task templates deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["taskGroup"] });
        },
        onError: (error: any) => {
            console.error('Delete error:', error);
            message.error(error.response?.data?.message || "Failed to delete task group");
        },
    });
};
