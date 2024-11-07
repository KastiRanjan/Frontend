import PageTitle from "@/components/PageTitle";
import TaskTemplateForm from "@/components/TaskTemplate/TaskTemplatForm";
import { useTaskTemplateById } from "@/hooks/taskTemplate/useTaskTemplateById";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const EditTaskTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data } = useTaskTemplateById({ id});
  return (
    <>
      <PageTitle
        title="Edit Task Template"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <TaskTemplateForm editTaskTemplateData={data} id={id} />
    </>
  );
};

export default EditTaskTemplate;
