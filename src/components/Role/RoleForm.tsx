import { useCreateRole } from "@/hooks/role/useCreateRole";
import { useEditRole } from "@/hooks/role/useEditRole";
import { Role } from "@/pages/Role/type";
import { Button, Form } from "antd";
import { useEffect } from "react";
import FormInputWrapper from "../FormInputWrapper";

interface RoleFormProps {
  editRoleData?: Role;
  id?: number;
}

const RoleForm = ({ editRoleData, id }: RoleFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateRole();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditRole();

  useEffect(() => {
    if (id && editRoleData) {
      form.setFieldsValue(editRoleData);
    } else {
      form.resetFields();
    }
  }, [editRoleData, form, id]);

  const onFinish = (values: any) => {
    const id = editRoleData?.id;
    id ? mutateEdit({ id, payload: values }) : mutate(values);
  };
  return (
    <Form form={form} layout="vertical" initialValues={{}} onFinish={onFinish}>
      <FormInputWrapper
        id="Role Name"
        label="Role Name"
        name="name"
        rules={[{ required: true, message: "Please input the project name!" }]}
      />

      <FormInputWrapper
        id="Description"
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please input the description!" }]}
      />

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isPending || isPendingEdit}
          loading={isPending || isPendingEdit}
        >
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RoleForm;
