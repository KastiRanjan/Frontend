import { Button, Form, Modal, Select } from "antd";
import { useCreatePermission } from "@/hooks/permission/useCreatePermission";
import FormInputWrapper from "@/components/FormInputWrapper";
import { FormattedMessage } from "react-intl";
import message from "@/pages/Permission/message";
import { useEditPermission } from "@/hooks/permission/useEditPermission";
import { PermissionType } from "@/pages/Permission/types";
import { useEffect } from "react";

interface PermissionFormProps {
  visible: boolean;
  onCancel: () => void;
  editPermissionData?: PermissionType;
  isformEdit?: boolean;
}

export const PermissionForm = ({
  visible,
  onCancel,
  editPermissionData,
  isformEdit,
}: PermissionFormProps) => {
  const { mutate, isPending } = useCreatePermission();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditPermission();
  const [form] = Form.useForm();

  useEffect(() => {
    isformEdit ? form.setFieldsValue(editPermissionData) : form.resetFields();
  }, [editPermissionData, form, isformEdit]);

  const onFinish = (values: any) => {
    isformEdit?mutateEdit({id:editPermissionData?.id, payload:values}) : mutate(values);
    onCancel();
  };


  return (
    <Modal open={visible} onCancel={onCancel} footer={null}>
      <FormattedMessage {...message.dashboardTitle} />
      <Form
        form={form}
        layout="vertical"
        initialValues={{}}
        onFinish={onFinish}
        autoComplete="off"
      >
        <FormInputWrapper
          id="resource"
          label="Resource"
          name="resource"
          rules={[{ required: true, message: "Please input your resource!" }]}
        />

        <FormInputWrapper
          label={"Description"}
          rules={[
            {
              required: true,
              message: <FormattedMessage {...message.descriptionRequired} />,
            },
          ]}
          name="description"
          id="description"
          type="text"
          required
          placeholder={"Input description"}
        />

        <Form.Item
          label="Method"
          name="method"
          rules={[{ required: true, message: "Please input your method!" }]}
        >
          <Select placeholder="Select Method">
            <Select.Option value="get">GET</Select.Option>
            <Select.Option value="post">POST</Select.Option>
            <Select.Option value="patch">PUT</Select.Option>
            <Select.Option value="delete">DELETE</Select.Option>
          </Select>
        </Form.Item>

        <FormInputWrapper
          id="path"
          label="Path"
          name="path"
          rules={[{ required: true, message: "Please input your path!" }]}
        />

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" disabled={isPending}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
