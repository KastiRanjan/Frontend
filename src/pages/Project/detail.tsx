import { useProjectById } from "@/hooks/project/useProjectById";
import { useParams } from "react-router-dom";
import ProjectDetailComponent from "@/components/project/ProjectDetail";


const ProjectDetail = () => {
  const { id } = useParams();

  const { data, isPending } = useProjectById({ id: id?.toString() });

  return (
    <>
      <ProjectDetailComponent project={data} loading={isPending}/>
    </>
  );

};


export default ProjectDetail;