import PageTitle from "@/components/PageTitle";
import TaskGroupForm from "@/components/TaskGroup/TaskGroupForm";
import { useTaskGroupById } from "@/hooks/taskGroup/useTaskGroupById";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const EditTaskGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: taskGroup } = useTaskGroupById({ id });
  return (
    <>
      <PageTitle
        title="Edit Task Group"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />

      <TaskGroupForm editTaskGroupData={taskGroup} id={id} />
    </>
  );
};

export default EditTaskGroup;
