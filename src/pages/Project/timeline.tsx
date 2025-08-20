import ProjectTimeline from "@/components/project/ProjectTimeline";
import { useParams } from "react-router-dom";

const ProjectTimelinePage = () => {
  const { id } = useParams();
  if (!id) return <div>Project not found</div>;
  return <ProjectTimeline projectId={Number(id)} />;
};

export default ProjectTimelinePage;
