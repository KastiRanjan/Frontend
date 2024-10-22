import PageTitle from "@/components/PageTitle";
import ProjectForm from "@/components/project/ProjectForm";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle title="Create new project" element={<Button type="primary" onClick={() => navigate(-1)}>Close</Button>} />
      <ProjectForm />
    </>
  );
};

export default CreateProject;
