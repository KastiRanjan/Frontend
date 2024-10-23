import PageTitle from "@/components/PageTitle";
import RoleForm from "@/components/Role/RoleForm";
import { useRoleById } from "@/hooks/role/useRoleById";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const EditRole = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: role } = useRoleById({ id });
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
      <RoleForm editRoleData={role} id={id} />
    </>
  );
};

export default EditRole;
