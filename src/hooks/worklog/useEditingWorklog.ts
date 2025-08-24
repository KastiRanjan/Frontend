import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editingWorklog } from "../../service/worklog.service";

export const useEditingWorklog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ date, startTime, endTime, description, approvedBy, status, id }: any) => {
            return editingWorklog({ date, startTime, endTime, description, approvedBy, status, id });
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
            queryClient.invalidateQueries({ queryKey: ["worklogs"] });
            queryClient.invalidateQueries({ queryKey: ["worklog-user"] });
            if (variables && variables.status) {
                queryClient.invalidateQueries({ queryKey: ["worklog-all", variables.status] });
                queryClient.invalidateQueries({ queryKey: ["worklog-user", variables.status] });
            }
        },
    });
};
