import PageTitle from "@/components/PageTitle";
import ProjectForm from "@/components/project/ProjectForm";
import { useProjectById } from "@/hooks/project/useProjectById";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useProjectById({ id: id?.toString() });

  return (
    <>
      <PageTitle
        title="Edit project"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <ProjectForm editProjectData={data} id={id} />
    </>
  );
};

export default EditProject;
