

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as workhourService from "../../service/workhour.service";
import { CreateWorkhourDto, UpdateWorkhourDto } from "../../types/workhour";

export function useWorkhours() {
	return useQuery({
		queryKey: ["workhours"],
		queryFn: workhourService.fetchWorkhours,
	});
}

export function useWorkhourHistory(roleId: string) {
	return useQuery({
		queryKey: ["workhourHistory", roleId],
		queryFn: () => workhourService.fetchWorkhourHistory(roleId),
		enabled: !!roleId,
	});
}

export function useCreateWorkhour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: workhourService.createWorkhour,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workhours"] }),
	});
}

export function useUpdateWorkhour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkhourDto }) => workhourService.updateWorkhour(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workhours"] }),
	});
}

export function useDeleteWorkhour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => workhourService.deleteWorkhour(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workhours"] }),
	});
}
