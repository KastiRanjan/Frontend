import { useCreateClient } from "@/hooks/client/useCreateClient";
import { useEditClient } from "@/hooks/client/useEditClient";
import { Button, Col, DatePicker, Form, Row } from "antd";
import moment from "moment"; // Import moment
import { useEffect } from "react";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";


interface ClientFormProps {
  editClientData?: any;
  id?: string;
}
const ClientForm = ({ editClientData, id }: ClientFormProps) => {
  const [form] = Form.useForm();
  const { mutate } = useCreateClient();
  const { mutate: mutateEdit } = useEditClient();

  useEffect(() => {
    if (id && editClientData) {
      const registeredDate = editClientData.registeredDate
        ? moment(editClientData.registeredDate) // Convert registeredDate to moment
        : null;

      form.setFieldsValue({
        ...editClientData,
        registeredDate,
      });
    } else {
      form.resetFields();
    }
  }, [editClientData, form, id]);
  

  const handleFinish = (values: any) => {
    id ? mutateEdit({ id, payload: values }) : mutate(values);
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Row gutter={16}>
        <Col span={10}>
          {/* Name Field */}
          <FormInputWrapper
            id="name"
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please input the name" },
              { max: 100, message: "Name cannot exceed 100 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* PAN No Field */}
          <FormInputWrapper
            id="panNo"
            name="panNo"
            label="PAN No"
            rules={[
              { required: true, message: "Please input the PAN No" },
              { max: 15, message: "PAN No cannot exceed 15 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Registered Date Field */}
          <Form.Item name="registeredDate" label="Registered Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={10}>
          {/* Status Field */}
          <FormSelectWrapper
            id="status"
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select the status" }]}
            options={[
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "archive", label: "Archive" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Country Field */}
          <FormInputWrapper
            id="country"
            name="country"
            label="Country"
            rules={[
              { required: true, message: "Please input the country" },
              { max: 100, message: "Country cannot exceed 100 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* State Field */}
          <FormInputWrapper
            id="state"
            name="state"
            label="State"
            rules={[
              { required: true, message: "Please input the state" },
              { max: 100, message: "State cannot exceed 100 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* District Field */}
          <FormInputWrapper
            id="district"
            name="district"
            label="District"
            rules={[
              { required: true, message: "Please input the district" },
              { max: 100, message: "District cannot exceed 100 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Local Jurisdiction Field */}
          <FormInputWrapper
            id="localJurisdiction"
            name="localJurisdiction"
            label="Local Jurisdiction"
            rules={[
              {
                required: true,
                message: "Please input the local jurisdiction",
              },
              {
                max: 100,
                message: "Local Jurisdiction cannot exceed 100 characters",
              },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Ward No Field (Optional) */}
          <FormInputWrapper
            id="wardNo"
            name="wardNo"
            label="Ward No"
            rules={[
              { max: 10, message: "Ward No cannot exceed 10 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Locality Field */}
          <FormInputWrapper
            id="locality"
            name="locality"
            label="Locality"
            rules={[
              { required: true, message: "Please input the locality" },
              { max: 100, message: "Locality cannot exceed 100 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Legal Status Field */}
          <FormSelectWrapper
            id="legalStatus"
            name="legalStatus"
            label="Legal Status"
            rules={[
              { required: true, message: "Please select the legal status" },
            ]}
            options={[
              { value: "private_limited", label: "Private Limited" },
              { value: "public_limited", label: "Public Limited" },
              { value: "partnership", label: "Partnership" },
              { value: "proprietorship", label: "Proprietorship" },
              { value: "natural_person", label: "Natural Person" },
              { value: "i_ngo", label: "I NGO" },
              { value: "cooperative", label: "Cooperative" },
              { value: "government_soe", label: "Government SOE" },
              { value: "others", label: "Others" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Business Size Field */}
          <FormSelectWrapper
            id="businessSize"
            name="businessSize"
            label="Business Size"
            rules={[
              { required: true, message: "Please select the business size" },
            ]}
            options={[
              { value: "micro", label: "Micro" },
              { value: "cottage", label: "Cottage" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "not_applicable", label: "Not Applicable" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Industry Nature Field */}
          <FormSelectWrapper
            id="industryNature"
            name="industryNature"
            label="Industry Nature"
            rules={[
              { required: true, message: "Please select the industry nature" },
            ]}
            options={[
              { value: "banking_finance", label: "Banking & Finance" },
              {
                value: "capital_market_broking",
                label: "Capital Market Broking",
              },
              { value: "insurance", label: "Insurance" },
              {
                value: "energy_mining_mineral",
                label: "Energy, Mining & Mineral",
              },
              { value: "manufacturing", label: "Manufacturing" },
              {
                value: "agriculture_forestry",
                label: "Agriculture & Forestry",
              },
              {
                value: "construction_real_estate",
                label: "Construction & Real Estate",
              },
              { value: "travel_tourism", label: "Travel & Tourism" },
              {
                value: "research_development",
                label: "Research & Development",
              },
              {
                value: "transportation_logistics_management",
                label: "Transportation & Logistics Management",
              },
              {
                value: "information_transmission_communication",
                label: "Information, Transmission & Communication",
              },
              { value: "aviation", label: "Aviation" },
              {
                value: "computer_electronics",
                label: "Computer & Electronics",
              },
              { value: "trading_of_goods", label: "Trading of Goods" },
              { value: "personal_service", label: "Personal Service" },
              {
                value: "business_related_service",
                label: "Business Related Service",
              },
              { value: "others", label: "Others" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Telephone No Field (Optional) */}
          <FormInputWrapper
            id="telephoneNo"
            name="telephoneNo"
            label="Telephone No"
            rules={[
              { max: 15, message: "Telephone No cannot exceed 15 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Mobile No Field (Optional) */}
          <FormInputWrapper
            id="mobileNo"
            name="mobileNo"
            label="Mobile No"
            rules={[
              { max: 15, message: "Mobile No cannot exceed 15 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Email Field (Optional) */}
          <FormInputWrapper
            id="email"
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Please input a valid email" }]}
          />
        </Col>
        <Col span={10}>
          {/* Website Field (Optional) */}
          <FormInputWrapper id="website" name="website" label="Website" />
        </Col>
        <Col span={10}>
          {/* Web Portal Field (Optional) */}
          <FormInputWrapper
            id="webPortal"
            name="webPortal"
            label="Web Portal"
          />
        </Col>
        <Col span={10}>
          {/* Login User Field (Optional) */}
          <FormInputWrapper
            id="loginUser"
            name="loginUser"
            label="Login User"
            rules={[
              { max: 100, message: "Login User cannot exceed 100 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Password Field (Optional) */}
          <FormInputWrapper
            id="password"
            name="password"
            label="Password"
            rules={[
              { max: 100, message: "Password cannot exceed 100 characters" },
            ]}
          />
        </Col>
        <Col span={10}>
          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ClientForm;
