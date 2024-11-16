import { deleteTaskTemplate } from "@/service/tasktemplate.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const useDeleteTaskTemplate = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: any) => {
            return deleteTaskTemplate({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["taskGroup", id] });
        },
    });
};
