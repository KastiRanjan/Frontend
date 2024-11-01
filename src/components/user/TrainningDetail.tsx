import { Form, InputNumber, Upload, Button } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const TrainingDetail = () => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = (info) => {
    setFileList(info.fileList);
  };

  return (
    <>
      <Title level={5}>Training & Others Details</Title>

      {/* University/College */}
      <FormInputWrapper
        id="institute"
        name="institute"
        label="University/College"
        rules={[{ required: true, message: "Please input the university/college name" }]}
      />

      {/* Designation of Course */}
      <FormInputWrapper
        id="designationOfCourse"
        name="designationOfCourse"
        label="Designation of Course"
        rules={[{ required: true, message: "Please input the designation of the course" }]}
      />

      {/* Year of Passing */}
      <Form.Item
        name="year"
        label="Year of Passing"
        // rules={[{ required: true, message: "Please input the year of passing" }]}
      >
        <InputNumber min={1900} max={new Date().getFullYear()} />
      </Form.Item>



      {/* Document File Upload
      <Form.Item
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
          beforeUpload={() => false} // Prevent auto-upload
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload> */}
      {/* </Form.Item> */}
    </>
  );
};

export default TrainingDetail;
