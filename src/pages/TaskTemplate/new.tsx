import PageTitle from "@/components/PageTitle";
import TaskTemplateForm from "@/components/TaskTemplate/TaskTemplatForm";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CreateTaskTemplate = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Create Task Template"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <TaskTemplateForm />
    </>
  );
};

export default CreateTaskTemplate;
