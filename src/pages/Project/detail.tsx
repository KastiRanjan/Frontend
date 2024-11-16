import PageTitle from "@/components/PageTitle";
import { useProjectById } from "@/hooks/project/useProjectById";
import { useNavigate, useParams } from "react-router-dom";
// import { Button } from "antd";
import ProjectDetailComponent from "@/components/project/ProjectDetail";


const ProjectDetail = () => {
  const { id } = useParams();

  const { data, isPending } = useProjectById({ id: id?.toString() });
  if (isPending) return <div>Loading...</div>


  return (
    <>
      <PageTitle
        title={data?.name} />

      <ProjectDetailComponent project={data} id={id} />
    </>
  );

};


export default ProjectDetail;