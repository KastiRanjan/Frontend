import React from "react";
import { Form, Input, InputNumber, Button } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";

const TaskTemplateForm = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log("Form values: ", values);
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      {/* Name */}
      <FormInputWrapper
        id="name"
        name="name"
        label="Name"
        rules={[
          { required: true, message: "Please input the name" },
          { max: 100, message: "Name cannot exceed 100 characters" },
        ]}
      />

      {/* Description (Optional) */}
      <Form.Item
        name="description"
        label="Description"
        rules={[
          { type: "string", message: "Please input a valid description" },
        ]}
      >
        <Input.TextArea />
      </Form.Item>

      {/* Group ID */}
      <FormSelectWrapper
        id="groupId"
        name="groupId"
        label="Group ID"
        rules={[
          { required: true, message: "Please select the group ID" },
        ]}
        options={[
          { value: 1, label: "Group 1" },
          { value: 2, label: "Group 2" },
          { value: 3, label: "Group 3" },
        ]}
      />

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TaskTemplateForm;
