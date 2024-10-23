import ClientForm from "@/components/Client/ClientForm";
import PageTitle from "@/components/PageTitle";
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
        title="Edit Client"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />

      <ClientForm editTaskGroupData={taskGroup} id={id} />
    </>
  );
};

export default EditTaskGroup;
