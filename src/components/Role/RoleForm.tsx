import { Button, DatePicker, Form, Modal,} from "antd";
import FormInputWrapper from "../FormInputWrapper";
import { Role } from "@/pages/Role/type";
import { useEffect } from "react";
import { useEditRole } from "@/hooks/role/useEditRole";
import { useCreateRole } from "@/hooks/role/useCreateRole";
import moment from "moment";

interface RoleFormProps {
  visible: boolean;
  onCancel: () => void;
  editRoleData?: Role;
  isformEdit?: boolean;
}

const RoleForm = ({
  visible,
  onCancel,
  editRoleData,
  isformEdit,
}: RoleFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateRole();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditRole();

  useEffect(() => {
    if (isformEdit && editRoleData) {
      form.setFieldsValue(editRoleData); // Set the form fields with editRoleData
    } else {
      form.resetFields(); // Reset fields if not editing
    }
  }, [editRoleData, form, isformEdit]);
  
  const onFinish = (values: any) => {
    const id = editRoleData?.id; // Optional chaining for safety
    isformEdit ? mutateEdit({ id, payload: values }) : mutate(values); // Ternary for mutation
    onCancel(); // Close the form/modal
  };
  return (
    <Modal
      title="Add New Role"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{}}
        onFinish={onFinish}
      >
        <FormInputWrapper
          id="Role Name"
          label="Role Name"
          name="name"
          rules={[
            { required: true, message: "Please input the project name!" },
          ]}
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
            style={{ width: "100%" }}
            disabled={isPending || isPendingEdit}
            loading={isPending || isPendingEdit}
          >
            {isformEdit ? "Update Role" : "Add Role"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleForm;
