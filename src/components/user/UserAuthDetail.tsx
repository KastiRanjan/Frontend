import Title from "antd/es/typography/Title";
import { Col, Row} from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useRole } from "../../hooks/role/useRole";
import { Role } from "@/pages/Role/type";


const UserAuthDetail = () => {
    const { data: roles, isPending } = useRole({page:1,limit:100});
  return (
    <>
      <Row>
        <Title level={5}>Auth Details</Title>
      </Row>
      <Row gutter={120}>
        <Col span={15}>
          <FormInputWrapper
            id="name"
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the name!" }]}
          />

          <FormInputWrapper
            id="email"
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input the email!" }]}
          />
        </Col>
        <Col span={9}>
          <FormSelectWrapper
            id="status"
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select the status!" }]}
          
            options={[
              {value:"active", label:"Active"},
              {value:"inactive", label:"Inactive"},
              {value:"suspended", label:"Suspended"},
            ]}
          />

          <FormSelectWrapper
            id="role"
            name="role"
            label="Role"
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
