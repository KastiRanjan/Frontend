import { Button, Form } from "antd";
import PersonalDetail from "./PersonalDetailForm";
import EducationDetail from "./EducationDetailForm";
import BankDetail from "./BankDetailForm";
import UserAuthDetail from "./UserAuthDetail";
import TrainningDetail from "./TrainningDetailForm";
import ContractDetail from "./ContractDetail";
import { useCreateUser } from "@/hooks/user/userCreateuser";

const UserForm = () => {
  const [formAuth] = Form.useForm();
  const [formPersonal] = Form.useForm();
  const [formEducation] = Form.useForm();
  const [formBank] = Form.useForm();
  const [formTraining] = Form.useForm();
  const [formContract] = Form.useForm();

  const { mutate } = useCreateUser();

  const handleFinish = () => {
    const authValues = formAuth.getFieldsValue();
    const personalValues = formPersonal.getFieldsValue();
    const educationValues = formEducation.getFieldsValue();
    const bankValues = formBank.getFieldsValue();
    const trainingValues = formTraining.getFieldsValue();
    const contractValues = formContract.getFieldsValue();

    const allValues = {
      ...authValues,
      personal: personalValues,
      education: educationValues,
      bank: bankValues,
      training: trainingValues,
      contract: contractValues,
    };

    console.log(allValues);

    mutate(allValues);
  };

  return (
    <div>
      <Form layout="vertical" onFinish={handleFinish}>
        <Form form={formAuth} layout="vertical" className="bg-[#eee] p-10 rounded-lg mb-5" scrollToFirstError>
          <UserAuthDetail />
        </Form>

        {/* <Form form={formPersonal} layout="vertical" className="mb-5">
          <PersonalDetail />
        </Form>

        <Form form={formEducation} layout="vertical" className="mb-5">
          <EducationDetail />
        </Form>

        <Form form={formBank} layout="vertical" className="mb-5">
          <BankDetail />
        </Form>

        <Form form={formTraining} layout="vertical" className="mb-5">
          <TrainningDetail />
        </Form>

        <Form form={formContract} layout="vertical" className="mb-3">
          <ContractDetail />
        </Form> */}

        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </div>
  );
};

export default UserForm;
