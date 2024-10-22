import { Form } from "antd";
import PersonalDetail from "./PersonalDetail";
import EducationDetail from "./EducationDetail";
import BankDetail from "./BankDetail";

const UserForm = () => {
  return (
    <div>
      <Form layout="vertical">
        <PersonalDetail />
        <EducationDetail />
        <BankDetail />
      </Form>
    </div>
  );
};
export default UserForm;
