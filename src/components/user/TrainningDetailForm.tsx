import { Button, Form, InputNumber } from "antd";
import { useState } from 'react';
import FormInputWrapper from "../FormInputWrapper";

const TrainingDetailForm = () => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
  };

  return (
    <>
      <Form layout="vertical">
        {/* University/College */}
        <FormInputWrapper
          id="institute"
          name="institute"
          label="University/College"
          rules={[{ message: "Please input the university/college name" }]}
        />

        {/* Designation of Course */}
        <FormInputWrapper
          id="designationOfCourse"
          name="designationOfCourse"
          label="Designation of Course"
          rules={[{ message: "Please input the designation of the course" }]}
        />

        {/* Year of Passing */}
        <Form.Item
          name="year"
          label="Year of Passing"
          rules={[{ message: "Please input the year of passing" }]}
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

        <Button type="primary" htmlType="submit">Save</Button>
      </Form>
    </>
  );
};

export default TrainingDetailForm;
