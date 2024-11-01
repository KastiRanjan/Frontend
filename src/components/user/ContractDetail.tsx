import { Form, Input, InputNumber, Upload, Button } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";
import { UploadOutlined } from '@ant-design/icons';

const ContractDetailForm = () => {
  return (
    <>
      <Title level={5}>Contract & Other Details</Title>

      {/* Contract Title */}
      <FormInputWrapper
        id="filename"
        name="filename"
        label="Filename"
        // rules={[{ required: true, message: "Please input the Filename" }]}
      />

      {/* Document File Upload */}
      {/* <Form.Item
        name="contractFile"
        label="Contract File"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
      >
        <Upload
          name="contractFile"
          listType="text"
          beforeUpload={() => false} // prevent auto-upload
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button> */}
        {/* </Upload> */}
      {/* </Form.Item> */}
    </>
  );
};

export default ContractDetailForm;
