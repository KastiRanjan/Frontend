import PageTitle from "@/components/PageTitle";
import UserForm from "@/components/user/UserForm";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Create new user"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <UserForm />
    </>
  );
};
export default CreateUser;
