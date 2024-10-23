import { Button, Form } from "antd";
import PersonalDetail from "./PersonalDetail";
import EducationDetail from "./EducationDetail";
import BankDetail from "./BankDetail";
import UserAuthDetail from "./UserAuthDetail";
import TrainningDetail from "./TrainningDetail";
import ContractDetail from "./ContractDetail";

const UserForm = () => {
  const [formAuth] = Form.useForm();
  const [formPersonal] = Form.useForm();
  const [formEducation] = Form.useForm();
  const [formBank] = Form.useForm();
  const [formTraining] = Form.useForm();
  const [formContract] = Form.useForm();

  const handleFinish = () => {
    const authValues = formAuth.getFieldsValue();
    const personalValues = formPersonal.getFieldsValue();
    const educationValues = formEducation.getFieldsValue();
    const bankValues = formBank.getFieldsValue();
    const trainingValues = formTraining.getFieldsValue();
    const contractValues = formContract.getFieldsValue();

    const allValues = {
      auth: authValues,
      personal: personalValues,
      education: educationValues,
      bank: bankValues,
      training: trainingValues,
      contract: contractValues,
    };

    console.log(allValues);
  };

  return (
    <div>
      <Form layout="vertical" onFinish={handleFinish}>
        <Form form={formAuth} layout="vertical">
          <UserAuthDetail />
        </Form>

        <Form form={formPersonal} layout="vertical">
          <PersonalDetail />
        </Form>

        <Form form={formEducation} layout="vertical">
          <EducationDetail />
        </Form>

        <Form form={formBank} layout="vertical">
          <BankDetail />
        </Form>

        <Form form={formTraining} layout="vertical">
          <TrainningDetail />
        </Form>

        <Form form={formContract} layout="vertical">
          <ContractDetail />
        </Form>

        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default UserForm;
