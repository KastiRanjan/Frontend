import PageTitle from "@/components/PageTitle";
import RolePermissionForm from "@/components/Role/RolePermissionForm";
import { useRoleById } from "@/hooks/role/useRoleById";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const RolePermision = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: role } = useRoleById({ id });
  return (
    <>
      <PageTitle
        title="Add Permission to Role"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <RolePermissionForm editRoleData={role} id={id} />
    </>
  );
};

export default RolePermision;
