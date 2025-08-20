import { Card,Button, Checkbox, Col, Form, InputNumber, Row, Switch, message } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useCreateUserDetail } from "@/hooks/user/userCreateuserDetail";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

// Define TypeScript interface for form values
interface PersonalDetailFormValues {
  department: string;
  location?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  gender?: string;
  taxCalculation?: string;
  panNo?: string;
  contactNo?: string;
  personalEmail?: string;
  permanentAddressCountry?: string;
  permanentAddressState?: string;
  permanentAddressDistrict?: string;
  permanentAddressLocalJurisdiction?: string;
  permanentAddressWardNo?: string;
  permanentAddressLocality?: string;
  temporaryAddressCountry?: string;
  temporaryAddressState?: string;
  temporaryAddressDistrict?: string;
  temporaryAddressLocalJurisdiction?: string;
  temporaryAddressWardNo?: string;
  temporaryAddressLocality?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianContact?: string;
  alternateContactNo?: string;
  casualLeaves?: number;
  examLeaves?: number;
  maternityLeaves?: number;
  paternityLeaves?: number;
  otherLeaves?: number;
  pf?: boolean;
  hourlyCostRate?: number;
  publicHolidayAllowance?: number;
}

interface PersonalDetailFormProps {
  initialValues?: Partial<PersonalDetailFormValues>;
}

const PersonalDetailForm = ({ initialValues }: PersonalDetailFormProps) => {
  const [form] = Form.useForm<PersonalDetailFormValues>();
  const mutation = useCreateUserDetail();
  const { mutate } = mutation;
  const queryClient = useQueryClient();
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const { id } = useParams();
  // Handle form submission
  const onFinish = (values: PersonalDetailFormValues) => {
    // If "Same as Permanent Address" is checked, copy permanent address fields
    if (sameAsPermanent) {
      values = {
        ...values,
        temporaryAddressCountry: values.permanentAddressCountry,
        temporaryAddressState: values.permanentAddressState,
        temporaryAddressDistrict: values.permanentAddressDistrict,
        temporaryAddressLocalJurisdiction: values.permanentAddressLocalJurisdiction,
        temporaryAddressWardNo: values.permanentAddressWardNo,
        temporaryAddressLocality: values.permanentAddressLocality,
      };
    }
    const payload = {...values}

    mutate({id,payload,query:"profile"},{
      onSuccess: () => {
        message.success("User details saved successfully!");
        // Refetch user details so parent gets latest data
        queryClient.invalidateQueries({ queryKey: ["users", id] });
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          "An error occurred while saving user details";
        message.error(errorMessage);
      },
    });
  };

  // Handle checkbox change for "Same as Permanent Address"
  const handleCheckboxChange = (e: any) => {
    const checked = e.target.checked;
    setSameAsPermanent(checked);
    if (checked) {
      const permanentFields = form.getFieldsValue([
        "permanentAddressCountry",
        "permanentAddressState",
        "permanentAddressDistrict",
        "permanentAddressLocalJurisdiction",
        "permanentAddressWardNo",
        "permanentAddressLocality",
      ]);
      form.setFieldsValue({
        temporaryAddressCountry: permanentFields.permanentAddressCountry,
        temporaryAddressState: permanentFields.permanentAddressState,
        temporaryAddressDistrict: permanentFields.permanentAddressDistrict,
        temporaryAddressLocalJurisdiction:
          permanentFields.permanentAddressLocalJurisdiction,
        temporaryAddressWardNo: permanentFields.permanentAddressWardNo,
        temporaryAddressLocality: permanentFields.permanentAddressLocality,
      });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <Card style={{ marginBottom: "20px" }}>
        <Title level={4}>Personal Details</Title>
        <Row gutter={16}>
          <Col span={8}>
            <FormSelectWrapper
              id="department"
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select a department!" }]}
              options={[
                { value: "operations", label: "Operations" },
                { value: "accounts", label: "Accounts" },
                { value: "administration", label: "Administration" },
              ]}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="location"
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please input a location!" }]}
            />
          </Col>
          <Col span={8}>
            <FormSelectWrapper
              id="bloodGroup"
              name="bloodGroup"
              label="Blood Group"
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
            />
          </Col>
          <Col span={8}>
            <FormSelectWrapper
              id="maritalStatus"
              name="maritalStatus"
              label="Marital Status"
              options={["single", "married", "divorced", "widowed"].map(
                (status) => ({ value: status, label: status })
              )}
            />
          </Col>
          <Col span={8}>
            <FormSelectWrapper
              id="gender"
              name="gender"
              label="Gender"
              options={["male", "female"].map((gender) => ({
                value: gender,
                label: gender,
              }))}
            />
          </Col>
          <Col span={8}>
            <FormSelectWrapper
              id="taxCalculation"
              name="taxCalculation"
              label="Tax Calculation"
              options={[
                { value: "single_assessee", label: "Single Assessee" },
                { value: "couple_assessees", label: "Couple Assessees" },
              ]}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="panNo"
              name="panNo"
              label="PAN No"
              rules={[
                { required: true, message: "Please input PAN number!" },
              ]}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="contactNo"
              name="contactNo"
              label="Contact No"
              rules={[
                { required: true, message: "Please input contact number!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Contact number must be 10 digits!",
                },
              ]}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="personalEmail"
              name="personalEmail"
              label="Personal Email"
              rules={[
                { required: true, message: "Please input personal email!" },
                { type: "email", message: "Please input a valid email!" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <Title level={4}>Permanent Address Details</Title>
        <Row gutter={16}>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressCountry"
              name="permanentAddressCountry"
              label="Country"
              rules={[{ required: true, message: "Please input country!" }]}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressState"
              name="permanentAddressState"
              label="State"
              rules={[{ required: true, message: "Please input state!" }]}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressDistrict"
              name="permanentAddressDistrict"
              label="District"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressLocalJurisdiction"
              name="permanentAddressLocalJurisdiction"
              label="Local Jurisdiction"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressWardNo"
              name="permanentAddressWardNo"
              label="Ward No"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressLocality"
              name="permanentAddressLocality"
              label="Locality"
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4}>Temporary Address Details</Title>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Checkbox onChange={handleCheckboxChange}>
                Same as Permanent Address
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressCountry"
              name="temporaryAddressCountry"
              label="Country"
              disabled={sameAsPermanent}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressState"
              name="temporaryAddressState"
              label="State"
              disabled={sameAsPermanent}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressDistrict"
              name="temporaryAddressDistrict"
              label="District"
              disabled={sameAsPermanent}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressLocalJurisdiction"
              name="temporaryAddressLocalJurisdiction"
              label="Local Jurisdiction"
              disabled={sameAsPermanent}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressWardNo"
              name="temporaryAddressWardNo"
              label="Ward No"
              disabled={sameAsPermanent}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressLocality"
              name="temporaryAddressLocality"
              label="Locality"
              disabled={sameAsPermanent}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <Title level={4}>Guardian Details</Title>
        <Row gutter={16}>
          <Col span={8}>
            <FormInputWrapper
              id="guardianName"
              name="guardianName"
              label="Guardian Name"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="guardianRelation"
              name="guardianRelation"
              label="Guardian Relation"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="guardianContact"
              name="guardianContact"
              label="Guardian Contact"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Contact number must be 10 digits!",
                },
              ]}
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="alternateContactNo"
              name="alternateContactNo"
              label="Alternate Contact No"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Contact number must be 10 digits!",
                },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <Title level={4}>Leave Details</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="casualLeaves" label="Casual Leaves">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="examLeaves" label="Exam Leaves">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maternityLeaves" label="Maternity Leaves">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paternityLeaves" label="Paternity Leaves">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="otherLeaves" label="Other Leaves">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="pf" label="Provident Fund" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <Title level={4}>Salary & Allowance Section</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="hourlyCostRate" label="Hourly Cost Rate">
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="publicHolidayAllowance" label="Public Holiday Allowance">
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

  <Button type="primary" htmlType="submit" loading={mutation.status === 'pending'}>
        Save
      </Button>
    </Form>
  );
};

export default PersonalDetailForm;