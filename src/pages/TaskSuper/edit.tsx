import { TaskSuperForm } from "@/components/TaskSuper";
import { useFetchTaskSuperById } from "@/hooks/taskSuper/useFetchTaskSuperById";
import { useParams } from "react-router-dom";

const EditTaskSuperPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: taskSuper, isPending } = useFetchTaskSuperById(id);

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Edit Task Super</h1>
      <TaskSuperForm
        editTaskSuperData={taskSuper}
        id={id}
        handleCancel={() => window.history.back()}
      />
    </div>
  );
};

export default EditTaskSuperPage;