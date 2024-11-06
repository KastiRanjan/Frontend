import { Button, Form, InputNumber, message, Upload, UploadProps } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { useCreateUserDetail } from "@/hooks/user/userCreateuserDetail";

const EducationDetailForm = () => {
  const [form] = Form.useForm();
  const { mutate } = useCreateUserDetail();
  const { id } = useParams();
  const uploadProps: UploadProps = {
    name: "file",
    headers: {
      authorization: "authorization-text",
    },
    beforeUpload(file) {
      // Prevent auto-upload by returning false
      return false;
    },
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const onFinish = async (payload: any) => {
    const formData = new FormData();
    console.log(payload.documentFile);

    // Append text fields from the form
    formData.append("universityCollege", payload.universityCollege);
    formData.append("faculty", payload.faculty);
    formData.append("yearOfPassing", payload.yearOfPassing);
    formData.append("placeOfIssue", payload.placeOfIssue);

    // Append file if it exists
    if (payload.documentFile && payload.documentFile.length > 0) {
      formData.append(
        "documentFile",
        payload.documentFile[0].originFileObj as File
      );
    }
    mutate({ id, payload: formData, query: "education" });
  };
  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <FormInputWrapper
        id="universityCollege"
        name="universityCollege"
        label="University/College"
      />

      {/* Faculty */}
      <FormInputWrapper id="faculty" name="faculty" label="Faculty" />

      {/* Year of Passing */}
      <Form.Item name="yearOfPassing" label="Year of Passing">
        <InputNumber min={1900} max={new Date().getFullYear()} />
      </Form.Item>

      {/* Place of Issue */}
      <FormInputWrapper
        id="placeOfIssue"
        name="placeOfIssue"
        label="Place of Issue"
      />

      <Form.Item
        name="documentFile"
        label="Upload File"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
        rules={[{ required: true, message: "Please upload a file!" }]}
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
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
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};
export default EducationDetailForm;
