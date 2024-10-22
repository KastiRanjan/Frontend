import { Form, Input, InputNumber, Upload } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";

const EducationDetail = () => {
  return (
    <>
      <Title level={5}>Education Details</Title>
      <FormInputWrapper
        id="universityCollege"
        name="universityCollege"
        label="University/College"
        rules={[
          {
            required: true,
            message: "Please input the university/college name",
          },
        ]}
      />

      {/* Faculty */}
      <FormInputWrapper
        id="faculty"
        name="faculty"
        label="Faculty"
        rules={[{ required: true, message: "Please input the faculty name" }]}
      />

      {/* Year of Passing */}
      <Form.Item
        name="yearOfPassing"
        label="Year of Passing"
        rules={[
          { required: true, message: "Please input the year of passing" },
        ]}
      >
        <InputNumber min={1900} max={new Date().getFullYear()} />
      </Form.Item>

      {/* Place of Issue */}
      <Form.Item
        name="placeOfIssue"
        label="Place of Issue"
        rules={[{ required: true, message: "Please input the place of issue" }]}
      >
        <Input maxLength={100} />
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
export default EducationDetail;
