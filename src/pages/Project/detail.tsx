import { useProjectById } from "@/hooks/project/useProjectById";
import { useParams } from "react-router-dom";
import ProjectDetailComponent from "@/components/project/ProjectDetail";


const ProjectDetail = () => {
  const { id } = useParams();

  const { data, isPending } = useProjectById({ id: id?.toString() });
  if (isPending) return <div>Loading...</div>
  


  return (
    <>
      <ProjectDetailComponent project={data}/>
    </>
  );

};


export default ProjectDetail;