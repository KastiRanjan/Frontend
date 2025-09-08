import { useCreateClient } from "@/hooks/client/useCreateClient";
import { useEditClient } from "@/hooks/client/useEditClient";
import { Button, Card, Col, DatePicker, Form, Row, Select } from "antd";
import moment from "moment"; // Import moment
import { useEffect, useState } from "react";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { 
  countries, 
  getStateOptions, 
  getDistrictOptions, 
  getLocalJurisdictionOptions 
} from "@/utils/locationData";

interface ClientFormProps {
  editClientData?: any;
  id?: string;
}
const ClientForm = ({ editClientData, id }: ClientFormProps) => {
  const [form] = Form.useForm();
  const { mutate } = useCreateClient();
  const { mutate: mutateEdit } = useEditClient();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  useEffect(() => {
    if (id && editClientData) {
      const registeredDate = editClientData.registeredDate
        ? moment(editClientData.registeredDate) // Convert registeredDate to moment
        : null;

      form.setFieldsValue({
        ...editClientData,
        registeredDate,
      });
      
      // Set selected values for cascading dropdowns
      setSelectedCountry(editClientData.country);
      setSelectedState(editClientData.state);
      setSelectedDistrict(editClientData.district);
    } else {
      form.resetFields();
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedDistrict(null);
    }
  }, [editClientData, form, id]);

  const handleFinish = (values: any) => {
    if (id) {
      mutateEdit({ id, payload: values });
    } else {
      mutate(values);
    }
  };

  return (
    <Card>
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Row gutter={24}>
          <Col span={8}>
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
          <Col span={8}>
            {/* Short Name Field */}
            <FormInputWrapper
              id="shortName"
              name="shortName"
              label="Short Name"
              rules={[
                { required: true, message: "Please input the short name" },
                { max: 20, message: "Short name cannot exceed 20 characters" },
              ]}
            />
          </Col>
          <Col span={8}>
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
          <Col span={8}>
            {/* Registered Date Field */}
            <Form.Item name="registeredDate" label="Registered Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <Col span={8}>
            {/* Country Field */}
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please select the country" }]}
            >
              <Select
                placeholder="Select country"
                options={countries}
                onChange={(value) => {
                  setSelectedCountry(value);
                  // Reset dependent fields when country changes
                  form.setFieldsValue({ state: undefined, district: undefined, localJurisdiction: undefined });
                  setSelectedState(null);
                  setSelectedDistrict(null);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            {/* State Field */}
            <Form.Item
              name="state"
              label="State/Province"
              rules={[{ required: true, message: "Please select the state/province" }]}
            >
              <Select
                placeholder="Select state/province"
                options={selectedCountry ? getStateOptions(selectedCountry) : []}
                disabled={!selectedCountry}
                onChange={(value) => {
                  setSelectedState(value);
                  // Reset dependent fields when state changes
                  form.setFieldsValue({ district: undefined, localJurisdiction: undefined });
                  setSelectedDistrict(null);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            {/* District Field */}
            <Form.Item
              name="district"
              label="District"
              rules={[{ required: true, message: "Please select the district" }]}
            >
              <Select
                placeholder="Select district"
                options={selectedState ? getDistrictOptions(selectedState) : []}
                disabled={!selectedState}
                onChange={(value) => {
                  setSelectedDistrict(value);
                  // Reset dependent field when district changes
                  form.setFieldsValue({ localJurisdiction: undefined });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            {/* Local Jurisdiction Field */}
            <Form.Item
              name="localJurisdiction"
              label="Local Jurisdiction"
              rules={[{ required: true, message: "Please select the local jurisdiction" }]}
            >
              <Select
                placeholder="Select local jurisdiction"
                options={selectedDistrict ? getLocalJurisdictionOptions(selectedDistrict) : []}
                disabled={!selectedDistrict}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <Col span={8}>
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
          <Col span={8}>
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
          <Col span={8}>
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
          <Col span={8}>
            {/* Industry Nature Field */}
            <FormSelectWrapper
              id="industryNature"
              name="industryNature"
              label="Industry Nature"
              rules={[
                {
                  required: true,
                  message: "Please select the industry nature",
                },
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
          <Col span={8}>
            {/* Telephone No Field (Optional) */}
            <FormInputWrapper
              id="telephoneNo"
              name="telephoneNo"
              label="Telephone No"
              rules={[
                {
                  max: 15,
                  message: "Telephone No cannot exceed 15 characters",
                },
              ]}
            />
          </Col>
          <Col span={8}>
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
          <Col span={8}>
            {/* Email Field (Optional) */}
            <FormInputWrapper
              id="email"
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please input a valid email" }]}
            />
          </Col>
          <Col span={8}>
            {/* Website Field (Optional) */}
            <FormInputWrapper id="website" name="website" label="Website" />
          </Col>
          <Col span={8}>
            {/* Web Portal Field (Optional) */}
            <FormInputWrapper
              id="webPortal"
              name="webPortal"
              label="Web Portal"
            />
          </Col>
          <Col span={8}>
            {/* Login User Field (Optional) */}
            <FormInputWrapper
              id="loginUser"
              name="loginUser"
              label="Login User"
              rules={[
                {
                  max: 100,
                  message: "Login User cannot exceed 100 characters",
                },
              ]}
            />
          </Col>
          <Col span={8}>
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
          <Col span={8}>
            {/* Submit Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Col>
        </Row> {/* Closing Row tag */}
      </Form>
    </Card>
  );
};

export default ClientForm;
