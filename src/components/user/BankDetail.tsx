import { Form, Input } from "antd";
import Title from "antd/es/typography/Title";

const BankDetail = () => {
  return (
    <>
      <Title level={5}>Bank Details</Title>
      <Form.Item
        name="bankName"
        label="Bank Name"
        rules={[{ required: true, message: "Please input the bank name" }]}
      >
        <Input maxLength={100} />
      </Form.Item>

      {/* Bank Branch */}
      <Form.Item
        name="bankBranch"
        label="Bank Branch"
        rules={[{ required: true, message: "Please input the bank branch" }]}
      >
        <Input maxLength={100} />
      </Form.Item>

      {/* Account Number */}
      <Form.Item
        name="accountNo"
        label="Account Number"
        rules={[
          { required: true, message: "Please input the account number" },
          { max: 20, message: "Account number cannot exceed 20 characters" },
        ]}
      >
        <Input maxLength={20} />
      </Form.Item>

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
