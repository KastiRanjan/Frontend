import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editingWorklog } from "../../service/worklog.service";

export const useEditingWorklog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ date, startTime, endTime, description, approvedBy, status, id }: any) => {
            return editingWorklog({ date, startTime, endTime, description, approvedBy, status, id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["worklog-all", 'open'] });
            queryClient.invalidateQueries({ queryKey: ["worklog-all", 'approved'] });
            queryClient.invalidateQueries({ queryKey: ["worklog-all", 'requested'] });
            queryClient.invalidateQueries({ queryKey: ["worklogs"] });
        },
    });
};
