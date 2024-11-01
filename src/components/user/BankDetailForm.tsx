import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";
import { Button, Col, Form, message, Row, Upload, UploadProps } from "antd";
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useUpdateUser } from "@/hooks/user/useUpdateUser";
import { useParams } from "react-router-dom";

const { Dragger } = Upload;

const BankDetailForm = () => {
  useUpdateUser();
  
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const {mutate}= useUpdateUser();
  const {id} = useParams()

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false; // Prevent automatic upload
    },
    onRemove: (file) => {
      setFileList(fileList.filter(item => item.uid !== file.uid));
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    // Append form fields
  
    Object.keys(values).forEach(key => {
      if (key === 'bankDetails') {
        // Add bank details separately
        Object.keys(values.bankDetails).forEach(bankKey => {
          formData.append(`bankDetails[${bankKey}]`, values.bankDetails[bankKey]);
        });
      } else {
        formData.append(key, values[key]);
      }
    });
    // Append files
    fileList.forEach(file => {
      formData.append('documentFile', file);
    });

   mutate({id: 1, payload:formData});
  };

  return (
    <>
      <Title level={3}>Bank Details</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={25}>
          <Col span={12}>
            <FormInputWrapper
              id="bankName"
              name="bankName"
              label="Bank Name"
              rules={[{ required: true, message: "Please input the bank name" }]}
            />
            <FormInputWrapper
              id="bankBranch"
              name="bankBranch"
              label="Bank Branch"
              rules={[{ required: true, message: "Please input the bank branch" }]}
            />
            <FormInputWrapper
              id="accountNo"
              name="accountNo"
              label="Account Number"
              rules={[{ required: true, message: "Please input the account number" }]}
            />
          </Col>
          <Col span={12}>
            <Form.Item
              label="Document File"
            >
              <Dragger {...props} fileList={fileList}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
                </p>
              </Dragger>
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit">Save</Button>
      </Form>
    </>
  );
};

export default BankDetailForm;
