import PageTitle from "@/components/PageTitle";
import ProjectUserTable from "@/components/project/ProjectUserTable";
import { useProjectById } from "@/hooks/project/useProjectById";
import { useParams } from "react-router-dom";

const ProjectUsers = () => {
  const { id } = useParams();

  const { data, isPending } = useProjectById({ id: id?.toString() });
  if (isPending) return <div>Loading...</div>;
  return (
    <>
      <PageTitle title="Project Users" />
      <ProjectUserTable project={data} />
    </>
  );
};

export default ProjectUsers;
