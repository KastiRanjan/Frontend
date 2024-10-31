import { Form, Input, InputNumber, Upload } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";

const EducationDetail = () => {
  return (
    <Form.Item name="educationDetails" label="Education Details">
      <Title level={5}>Education Details</Title>
      <FormInputWrapper
        id="universityCollege"
        name="universityCollege"
        label="University/College"
      />

      {/* Faculty */}
      <FormInputWrapper
        id="faculty"
        name="faculty"
        label="Faculty"
      />

      {/* Year of Passing */}
      <Form.Item
        name="yearOfPassing"
        label="Year of Passing"
      >
        <InputNumber min={1900} max={new Date().getFullYear()} />
      </Form.Item>

      {/* Place of Issue */}
      <FormInputWrapper
        id="placeOfIssue"
        name="placeOfIssue"
        label="Place of Issue"
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
    </Form.Item>
  );
};
export default EducationDetail;
