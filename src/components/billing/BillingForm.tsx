import { useCreateBilling } from "@/hooks/billing/useCreateBilling";
import { useEditBilling } from "@/hooks/billing/useEditBilling";
import { BillingType } from "@/types/billing";
import { Button, Col, Form, Input, Row, Select, Checkbox } from "antd";
import { useEffect, useState } from "react";
import FormInputWrapper from "@/components/FormInputWrapper";
import FormSelectWrapper from "@/components/FormSelectWrapper";
import { 
  countries, 
  getStateOptions, 
  getDistrictOptions, 
  getLocalJurisdictionOptions 
} from "@/utils/locationData";

interface BillingFormProps {
  editBillingData?: BillingType;
  handleCancel: () => void;
}

const BillingForm = ({ editBillingData, handleCancel }: BillingFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateBilling();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditBilling();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isVatRegistered, setIsVatRegistered] = useState<boolean>(false);

  const onFinish = (values: any) => {
    // Create a modified payload with the appropriate VAT number handling
    const payload = {
      ...values,
      // Clear vat_number if not VAT registered
      vat_number: values.is_vat_registered ? values.vat_number : null
    };
    
    // Remove the is_vat_registered field as it's not part of the backend model
    delete payload.is_vat_registered;
    
    if (editBillingData?.id) {
      mutateEdit(
        { id: editBillingData.id.toString(), payload },
        { onSuccess: () => handleCancel() }
      );
    } else {
      mutate(payload, { onSuccess: () => handleCancel() });
    }
  };

  useEffect(() => {
    if (editBillingData) {
      form.setFieldsValue({
        name: editBillingData.name,
        shortName: editBillingData.shortName,
        registration_number: editBillingData.registration_number,
        pan_number: editBillingData.pan_number,
        vat_number: editBillingData.vat_number,
        address: editBillingData.address,
        email: editBillingData.email,
        phone: editBillingData.phone,
        logo_url: editBillingData.logo_url,
        bank_account_name: editBillingData.bank_account_name,
        bank_name: editBillingData.bank_name,
        bank_account_number: editBillingData.bank_account_number,
        status: editBillingData.status,
        country: editBillingData.country,
        state: editBillingData.state,
        district: editBillingData.district,
        localJurisdiction: editBillingData.localJurisdiction,
        is_vat_registered: !!editBillingData.vat_number // Set checkbox based on whether VAT number exists
      });
      
      // Set selected values for cascading dropdowns
      setSelectedCountry(editBillingData.country);
      setSelectedState(editBillingData.state);
      setSelectedDistrict(editBillingData.district);
      
      // Set VAT registration status based on whether VAT number exists
      setIsVatRegistered(!!editBillingData.vat_number);
    } else {
      form.resetFields();
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedDistrict(null);
      setIsVatRegistered(false);
    }
  }, [editBillingData, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Row gutter={18}>
        <Col span={24}>
          <FormInputWrapper
            id="Name"
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please input the billing entity name!" },
            ]}
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="ShortName"
            label="Short Name"
            name="shortName"
            rules={[
              { required: true, message: "Please input the short name for billing entity!" },
              { max: 20, message: "Short name cannot be longer than 20 characters!" }
            ]}
            placeholder="Short name for auto-generating project names"
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="Registration Number"
            label="Registration Number"
            name="registration_number"
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="PAN Number"
            label="PAN Number"
            name="pan_number"
          />
        </Col>

        <Col span={12}>
          <Form.Item
            name="is_vat_registered"
            valuePropName="checked"
          >
            <Checkbox onChange={(e) => setIsVatRegistered(e.target.checked)}>
              VAT Registered
            </Checkbox>
          </Form.Item>
          {/* When VAT Registered is checked, the VAT Number field will be displayed and required */}
        </Col>

        {isVatRegistered && (
          <Col span={12}>
            <FormInputWrapper
              id="VAT Number"
              label="VAT Number"
              name="vat_number"
              rules={[
                { required: true, message: "Please input the VAT number!" }
              ]}
            />
          </Col>
        )}

        <Col span={12}>
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
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={12}>
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
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={12}>
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
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="localJurisdiction"
            label="Local Jurisdiction"
            rules={[{ required: true, message: "Please select the local jurisdiction" }]}
          >
            <Select
              placeholder="Select local jurisdiction"
              options={selectedDistrict ? getLocalJurisdictionOptions(selectedDistrict) : []}
              disabled={!selectedDistrict}
              allowClear
            />
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <FormInputWrapper
            id="Address"
            label="Local Address"
            name="address"
            placeholder="Detailed local address"
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="Email"
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="Phone"
            label="Phone"
            name="phone"
          />
        </Col>

        <Col span={24}>
          <FormInputWrapper
            id="Logo URL"
            label="Logo URL"
            name="logo_url"
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="Bank Account Name"
            label="Bank Account Name"
            name="bank_account_name"
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="Bank Name"
            label="Bank Name"
            name="bank_name"
          />
        </Col>

        <Col span={12}>
          <FormInputWrapper
            id="Bank Account Number"
            label="Bank Account Number"
            name="bank_account_number"
          />
        </Col>

        <Col span={12}>
          <FormSelectWrapper
            id="Status"
            label="Status"
            name="status"
            options={[
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "archived", label: "Archived" },
            ]}
            rules={[{ required: true, message: "Please select the status!" }]}
          />
        </Col>
      </Row>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isPending || isPendingEdit}
          loading={isPending || isPendingEdit}
        >
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BillingForm;
