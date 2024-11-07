import Title from "antd/es/typography/Title";
import { Col, Row } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useRole } from "../../hooks/role/useRole";
import { Role } from "@/pages/Role/type";
import Paragraph from "antd/es/typography/Paragraph";


const UserAuthDetail = () => {
  const { data: roles } = useRole({ page: 1, limit: 100 });
  return (
    <>
      <div>
        <Title level={5}>Account Details</Title>
        <Paragraph>These field are use for authentication and all the field  are required.</Paragraph>
      </div>
      <Row gutter={10}>
        <Col span={8}>
          <FormInputWrapper
            id="name"
            name="name"
            label="Name"
            required
            rules={[{ required: true, message: "Please input the name!" }]}
          />

          <FormInputWrapper
            id="email"
            name="email"
            label="Email"
            required
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please input a valid email!" },
            ]}
          />
        </Col>
        <Col span={6}>
          <FormSelectWrapper
            id="status"
            name="status"
            label="Status"
            required
            rules={[{ required: true, message: "Please select the status!" }]}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "suspended", label: "Suspended" },
            ]}
          />

          <FormSelectWrapper
            id="role"
            name="role"
            label="Role"
            required
            rules={[{ required: true, message: "Please select the role!" }]}
            options={
              roles?.results?.map((role: Role) => ({
                value: role.id,
                label: role.name,
              })) || []
            }
          />
        </Col>
      </Row>
    </>
  );
};

export default UserAuthDetail;
