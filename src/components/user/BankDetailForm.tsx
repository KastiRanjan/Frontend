import { useCreateUserDetail } from "@/hooks/user/userCreateuserDetail";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Col, Form, message, Row, Upload, UploadProps } from "antd";
import { useParams } from "react-router-dom";
import FormInputWrapper from "../FormInputWrapper";

const BankDetailForm = () => {


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
    formData.append("bankName", payload.bankName);
    formData.append("bankBranch", payload.bankBranch);
    formData.append("accountNo", payload.accountNo);

    // Append file if it exists
    if (payload.documentFile && payload.documentFile.length > 0) {
      formData.append(
        "documentFile",
        payload.documentFile[0].originFileObj as File
      );
    }
    mutate({ id, payload: formData, query: "bank" });
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={25}>
          <Col span={12}>
            <FormInputWrapper
              id="bankName"
              name="bankName"
              label="Bank Name"
              rules={[
                { required: true, message: "Please input the bank name" },
              ]}
            />
            <FormInputWrapper
              id="bankBranch"
              name="bankBranch"
              label="Bank Branch"
              rules={[
                { required: true, message: "Please input the bank branch" },
              ]}
            />
            <FormInputWrapper
              id="accountNo"
              name="accountNo"
              label="Account Number"
              rules={[
                { required: true, message: "Please input the account number" },
              ]}
            />
          </Col>
          <Col span={12}>
            <Form.Item
              name="documentFile"
              label="Upload File"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
              rules={[{ required: true, message: "Please upload a file!" }]}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </>
  );
};

export default BankDetailForm;
