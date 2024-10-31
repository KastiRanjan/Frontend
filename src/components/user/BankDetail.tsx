import { Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";

const BankDetail = () => {
  return (
    <>
      <Title level={5}>Bank Details</Title>
      <FormInputWrapper
        id="bankName"
        name="bankName"
        label="Bank Name"
      />

      {/* Bank Branch */}
      <FormInputWrapper
        id="bankBranch"
        name="bankBranch"
        label="Bank Branch"
      // rules={[{ required: true, message: "Please input the bank branch" }]}
      />

      {/* Account Number */}
      <FormInputWrapper
        id="accountNo"
        name="accountNo"
        label="Account Number"
      />

      {/* Document File Upload */}
      {/* <Form.Item
        name="documentFile"
        label="Document File"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
      >
        <Upload
          name="documentFile"
          listType="text"
          fileList={fileList}
          onChange={handleUploadChange}
          beforeUpload={() => false} // prevent auto-upload
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item> */}
    </>
  );
};

export default BankDetail;
