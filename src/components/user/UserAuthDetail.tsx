import { Role } from "@/pages/Role/type";
import { Col, Row, Select as AntSelect, Form } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { useRole } from "../../hooks/role/useRole";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { UserType } from "@/types/user";
import { useState } from "react";
import { 
  countries, 
  getStateOptions, 
  getDistrictOptions, 
  getLocalJurisdictionOptions 
} from "@/utils/locationData";


const UserAuthDetail = ({ initialValues }: { initialValues?: UserType }) => {
  const { data: roles } = useRole({ page: 1, limit: 100 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    initialValues?.country || null
  );
  const [selectedState, setSelectedState] = useState<string | null>(
    initialValues?.state || null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    initialValues?.district || null
  );

  return (
    <>
      <div>
        <Paragraph>These field are use for authentication and all the field  are required.</Paragraph>

      </div>
      <Row gutter={10}>
        <Col span={12}>
          <FormInputWrapper
            id="name"
            name="name"
            label="Name"
            required
            rules={[{ required: true, message: "Please input the name!" }]}
          />
        </Col>
        <Col span={12}>
          <FormInputWrapper
            id="username"
            name="username"
            label="Username"
            required
            rules={[{ required: true, message: "Please input the name!" }]}
          />
        </Col>
        <Col span={12}>
          <FormInputWrapper
            disabled={!!initialValues?.email}
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
        <Col span={12}>
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
        </Col>

        <Col span={12}>
          <FormSelectWrapper
            id="role"
            name="roleId"
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
      <Paragraph>Note:An email will be sent to the user to verify their account.</Paragraph>

    </>
  );
};

export default UserAuthDetail;
