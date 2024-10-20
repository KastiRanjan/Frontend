import { Button, Form, Modal, Select } from "antd";
import { useCreatePermission } from "@/hooks/useCreatePermission";
import FormInputWrapper from "@/components/FormInputWrapper";
import { FormattedMessage } from "react-intl";
import message from "@/pages/Permission/message";

export const PermissionForm = ({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
}) => {
  const { mutate, isPending } = useCreatePermission();
  const onFinish = (values: any) => {
    mutate(values);
    onCancel();
  };

  return (
    <Modal open={visible} onCancel={onCancel} footer={null}>
      <FormattedMessage {...message.dashboardTitle} />
      <Form
        layout="vertical"
        initialValues={{ remember: true }}
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
