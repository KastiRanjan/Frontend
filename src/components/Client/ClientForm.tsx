import { useCreateClient } from "@/hooks/client/useCreateClient";
import { useEditClient } from "@/hooks/client/useEditClient";
import { useBusinessOptions } from "@/hooks/useBusinessOptions";
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
  const [selectedCountry, setSelectedCountry] = useState<string | null>("nepal");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const { 
    businessSizeOptions, 
    businessNatureOptions,
    legalStatusOptions,
    businessSizeEnumOptions,
    businessNatureEnumOptions,
    legalStatusEnumOptions,
    loading: businessOptionsLoading 
  } = useBusinessOptions();

  useEffect(() => {
    if (id && editClientData) {
      const registeredDate = editClientData.registeredDate
        ? moment(editClientData.registeredDate) // Convert registeredDate to moment
        : null;

        // Prepare data for form with either entity ID or enum fallback values
      const formData = {
        ...editClientData,
        registeredDate,
        // If we have business size entity data, use businessSizeId, otherwise use enum
        businessSizeId: editClientData.businessSize?.id || null,
        businessSizeEnum: !editClientData.businessSize?.id ? editClientData.businessSizeEnum : null,
        // If we have industry nature entity data, use industryNatureId, otherwise use enum
        industryNatureId: editClientData.industryNature?.id || null,
        industryNatureEnum: !editClientData.industryNature?.id ? editClientData.industryNatureEnum : null,
        // If we have legal status entity data, use legalStatusId, otherwise use enum
        legalStatusId: editClientData.legalStatus?.id || null,
        legalStatusEnum: !editClientData.legalStatus?.id ? editClientData.legalStatusEnum : null,
      };
      
      form.setFieldsValue(formData);
      
      // Set selected values for cascading dropdowns
      setSelectedCountry(editClientData.country);
      setSelectedState(editClientData.state);
      setSelectedDistrict(editClientData.district);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "active", country: "nepal" });
      setSelectedCountry("nepal");
      setSelectedState(null);
      setSelectedDistrict(null);
    }
  }, [editClientData, form, id]);

  const handleFinish = (values: any) => {
    // Prepare the payload with either entity IDs or enum values
    const payload = {
      ...values,
      // For backward compatibility, ensure we have either businessSizeId or businessSizeEnum
      businessSizeId: values.businessSizeId || null,
      businessSizeEnum: !values.businessSizeId ? values.businessSizeEnum : null,
      // For backward compatibility, ensure we have either industryNatureId or industryNatureEnum
      industryNatureId: values.industryNatureId || null,
      industryNatureEnum: !values.industryNatureId ? values.industryNatureEnum : null,
      // For backward compatibility, ensure we have either legalStatusId or legalStatusEnum
      legalStatusId: values.legalStatusId || null,
      legalStatusEnum: !values.legalStatusId ? values.legalStatusEnum : null,
    };
    
    if (id) {
      mutateEdit({ id, payload });
    } else {
      mutate(payload);
    }
  };

  return (
    <Card>
      <Form form={form} onFinish={handleFinish} layout="vertical" initialValues={{ status: "active", country: "nepal" }}>
        <Row gutter={24}>
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
            {/* Registered Date Field */}
            <Form.Item name="registeredDate" label="Registered Date">
              <DatePicker className="h-[46px] bg-[#eee] w-full border-none" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
            {/* Country Field */}
            <FormSelectWrapper
              id="country"
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please select the country" }]}
              placeholder="Select country"
              options={countries}
              changeHandler={(value: string) => {
                setSelectedCountry(value);
                // Reset dependent fields when country changes
                form.setFieldsValue({ state: undefined, district: undefined, localJurisdiction: undefined });
                setSelectedState(null);
                setSelectedDistrict(null);
              }}
            />
          </Col>
          <Col span={8} style={{ height: "90px" }}>
            {/* State Field */}
            <FormSelectWrapper
              id="state"
              name="state"
              label="State/Province"
              rules={[{ required: true, message: "Please select the state/province" }]}
              placeholder="Select state/province"
              options={selectedCountry ? getStateOptions(selectedCountry) : []}
              disabled={!selectedCountry}
              changeHandler={(value: string) => {
                setSelectedState(value);
                // Reset dependent fields when state changes
                form.setFieldsValue({ district: undefined, localJurisdiction: undefined });
                setSelectedDistrict(null);
              }}
            />
          </Col>
          <Col span={8} style={{ height: "90px" }}>
            {/* District Field */}
            <FormSelectWrapper
              id="district"
              name="district"
              label="District"
              rules={[{ required: true, message: "Please select the district" }]}
              placeholder="Select district"
              options={selectedState ? getDistrictOptions(selectedState) : []}
              disabled={!selectedState}
              changeHandler={(value: string) => {
                setSelectedDistrict(value);
                // Reset dependent field when district changes
                form.setFieldsValue({ localJurisdiction: undefined });
              }}
            />
          </Col>
          <Col span={8} style={{ height: "90px" }}>
            {/* Local Jurisdiction Field */}
            <FormSelectWrapper
              id="localJurisdiction"
              name="localJurisdiction"
              label="Local Jurisdiction"
              rules={[{ required: true, message: "Please select the local jurisdiction" }]}
              placeholder="Select local jurisdiction"
              options={selectedDistrict ? getLocalJurisdictionOptions(selectedDistrict) : []}
              disabled={!selectedDistrict}
            />
          </Col>
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
            {/* Legal Status Field */}
            <FormSelectWrapper
              id="legalStatusId"
              name="legalStatusId"
              label="Legal Status"
              rules={[{ required: true, message: "Please select the legal status" }]}
              placeholder="Select legal status"
              loading={businessOptionsLoading.legalStatuses}
              options={legalStatusOptions.length > 0 ? legalStatusOptions : legalStatusEnumOptions}
              optionFilterProp="label"
              showSearch
            />
            
            {/* Fallback for enum-based legal status */}
            <Form.Item
              name="legalStatusEnum"
              hidden
            >
              <Select
                options={legalStatusEnumOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8} style={{ height: "90px" }}>
            {/* Business Size Field */}
            <FormSelectWrapper
              id="businessSizeId"
              name="businessSizeId"
              label="Business Size"
              rules={[{ required: true, message: "Please select the business size" }]}
              placeholder="Select business size"
              loading={businessOptionsLoading.businessSizes}
              options={businessSizeOptions.length > 0 ? businessSizeOptions : businessSizeEnumOptions}
              optionFilterProp="label"
              showSearch
            />
            
            {/* Fallback for enum-based business size */}
            <Form.Item
              name="businessSizeEnum"
              hidden
            >
              <Select
                options={businessSizeEnumOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8} style={{ height: "90px" }}>
            {/* Industry Nature Field */}
            <FormSelectWrapper
              id="industryNatureId"
              name="industryNatureId"
              label="Industry Nature"
              rules={[{ required: true, message: "Please select the industry nature" }]}
              placeholder="Select industry nature"
              loading={businessOptionsLoading.businessNatures}
              options={businessNatureOptions.length > 0 ? businessNatureOptions : businessNatureEnumOptions}
              optionFilterProp="label"
              showSearch
            />
            
            {/* Fallback for enum-based industry nature */}
            <Form.Item
              name="industryNatureEnum"
              hidden
            >
              <Select
                options={businessNatureEnumOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
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
          <Col span={8} style={{ height: "90px" }}>
            {/* Email Field (Optional) */}
            <FormInputWrapper
              id="email"
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please input a valid email" }]}
            />
          </Col>
          <Col span={8} style={{ height: "90px" }}>
            {/* Website Field (Optional) */}
            <FormInputWrapper id="website" name="website" label="Website" />
          </Col>
          <Col span={8} style={{ height: "90px" }}>
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
