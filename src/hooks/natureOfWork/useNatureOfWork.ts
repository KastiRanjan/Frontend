import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNatureOfWork,
  createNatureOfWorkGroup,
  deleteNatureOfWork,
  deleteNatureOfWorkGroup,
  fetchActiveAffectedProjects,
  fetchNatureOfWorkGroups,
  fetchNatureOfWorks,
  migrateNatureOfWork,
  updateNatureOfWork,
  updateNatureOfWorkGroup,
  MigrateNatureOfWorkPayload,
} from "@/service/natureOfWork.service";

export const NATURE_OF_WORK_QUERY_KEY = ["nature-of-work"] as const;
export const NATURE_OF_WORK_GROUP_QUERY_KEY = ["nature-of-work-group"] as const;

export const useNatureOfWorkList = (includeInactive = false) => {
  return useQuery({
    queryKey: [...NATURE_OF_WORK_QUERY_KEY, includeInactive],
    queryFn: () => fetchNatureOfWorks(includeInactive),
  });
};

export const useNatureOfWorkGroupList = () => {
  return useQuery({
    queryKey: NATURE_OF_WORK_GROUP_QUERY_KEY,
    queryFn: fetchNatureOfWorkGroups,
  });
};

export const useActiveAffectedProjects = (natureOfWorkId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["nature-of-work-active-affected-projects", natureOfWorkId],
    queryFn: () => fetchActiveAffectedProjects(natureOfWorkId as string),
    enabled: enabled && !!natureOfWorkId,
  });
};

const invalidateNatureQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: NATURE_OF_WORK_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: NATURE_OF_WORK_GROUP_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
    queryClient.invalidateQueries({ queryKey: ["project"] }),
  ]);
};

export const useCreateNatureOfWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNatureOfWork,
    onSuccess: async () => {
      await invalidateNatureQueries(queryClient);
    },
  });
};

export const useUpdateNatureOfWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateNatureOfWork(id, payload),
    onSuccess: async () => {
      await invalidateNatureQueries(queryClient);
    },
  });
};

export const useDeleteNatureOfWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNatureOfWork,
    onSuccess: async () => {
      await invalidateNatureQueries(queryClient);
    },
  });
};

export const useMigrateNatureOfWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MigrateNatureOfWorkPayload) => migrateNatureOfWork(payload),
    onSuccess: async () => {
      await invalidateNatureQueries(queryClient);
    },
  });
};

export const useCreateNatureOfWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNatureOfWorkGroup,
    onSuccess: async () => {
      await invalidateNatureQueries(queryClient);
    },
  });
};

export const useUpdateNatureOfWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateNatureOfWorkGroup(id, payload),
    onSuccess: async () => {
      await invalidateNatureQueries(queryClient);
    },
  });
};

export const useDeleteNatureOfWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNatureOfWorkGroup,
    onSuccess: async () => {
      await invalidateNatureQueries(queryClient);
    },
  });
};
