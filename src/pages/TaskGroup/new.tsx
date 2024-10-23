import PageTitle from "@/components/PageTitle";
import TaskGroupForm from "@/components/TaskGroup/TaskGroupForm";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CreateTaskGroup = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Create Task Group"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <TaskGroupForm />
    </>
  );
};

export default CreateTaskGroup;
