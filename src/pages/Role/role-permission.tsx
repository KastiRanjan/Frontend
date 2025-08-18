import PageTitle from "@/components/PageTitle";
import RolePermissionForm from "@/components/Role/RolePermissionForm";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const RolePermision = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <>
      <PageTitle
        title="Assign Permissions to Role"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <RolePermissionForm id={id} />
    </>
  );
};

export default RolePermision;