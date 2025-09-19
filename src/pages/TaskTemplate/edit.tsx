import PageTitle from "@/components/PageTitle";
import TaskTemplateForm from "@/components/TaskTemplate/TaskTemplatForm";
import { useTaskTemplateById } from "@/hooks/taskTemplate/useTaskTemplateById";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const EditTaskTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading } = useTaskTemplateById({ id });
  
  // Make sure to log data to see what we're getting
  console.log("Edit TaskTemplate Data:", data);
  
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
      {isLoading ? (
        <div>Loading template data...</div>
      ) : (
        <TaskTemplateForm 
          editTaskTemplateData={data} 
          handleCancel={() => navigate(-1)}
          // Explicitly pass the groupId from the template's group or groupId field
          groupId={data?.group?.id || data?.groupId}
        />
      )}
    </>
  );
};

export default EditTaskTemplate;
