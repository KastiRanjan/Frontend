import ClientForm from "@/components/Client/ClientForm";
import PageTitle from "@/components/PageTitle";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CreateTaskGroup = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Create New Client"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <ClientForm />
    </>
  );
};

export default CreateTaskGroup;
