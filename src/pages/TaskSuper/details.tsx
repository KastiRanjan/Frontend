import { useParams } from "react-router-dom";
import TaskSuperDetails from "@/components/TaskSuper/TaskSuperDetails";

const TaskSuperDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <TaskSuperDetails />
    </div>
  );
};

export default TaskSuperDetailsPage;