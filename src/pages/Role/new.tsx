import PageTitle from "@/components/PageTitle";
import RoleForm from "@/components/Role/RoleForm";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CreateRole = () => {
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
      <RoleForm />
    </>
  );
};

export default CreateRole;
