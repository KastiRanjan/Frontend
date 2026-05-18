import { QueryClient } from "@tanstack/react-query";

type ProjectId = string | number | undefined | null;

export const invalidateProjectQueries = (
  queryClient: QueryClient,
  projectId?: ProjectId
) => {
  const id = projectId === undefined || projectId === null ? undefined : String(projectId);

  queryClient.invalidateQueries({ queryKey: ["projects"] });
  queryClient.invalidateQueries({ queryKey: ["project"] });
  queryClient.invalidateQueries({ queryKey: ["project_task"] });
  queryClient.invalidateQueries({ queryKey: ["project_tasks"] });
  queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy"] });
  queryClient.invalidateQueries({ queryKey: ["projectTaskGroups"] });
  queryClient.invalidateQueries({ queryKey: ["taskRankings"] });
  queryClient.invalidateQueries({ queryKey: ["user_project_tasks"] });
  queryClient.invalidateQueries({ queryKey: ["current_user_tasks"] });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["project-worklogs"] });
  queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
  queryClient.invalidateQueries({ queryKey: ["worklog-user"] });
  queryClient.invalidateQueries({ queryKey: ["worklog-admin-all"] });
  queryClient.invalidateQueries({ queryKey: ["staff-accessible-projects"] });
  queryClient.invalidateQueries({ queryKey: ["projects-by-customer"] });
  queryClient.invalidateQueries({ queryKey: ["client-portal-projects"] });
  queryClient.invalidateQueries({ queryKey: ["client-portal-company"] });
  queryClient.invalidateQueries({ queryKey: ["client-reports"] });

  if (!id) return;

  queryClient.invalidateQueries({ queryKey: ["project", id] });
  queryClient.invalidateQueries({ queryKey: ["project_task", id] });
  queryClient.invalidateQueries({ queryKey: ["project_tasks", id] });
  queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy", id] });
  queryClient.invalidateQueries({ queryKey: ["projectTaskGroups", id] });
  queryClient.invalidateQueries({ queryKey: ["taskRankings", id] });
  queryClient.invalidateQueries({ queryKey: ["project-worklogs", id] });
  queryClient.invalidateQueries({ queryKey: ["client-portal-project", id] });
};
