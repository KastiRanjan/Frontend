import { Button, Checkbox, Col, Form, InputNumber, Row, Switch } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";


const PersonalDetailForm = ({ initialValues }: any) => {
  const [form] = Form.useForm();


  return (
    <>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Row gutter={30}>
          <Col span={8}>
            <FormSelectWrapper
              id="department"
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
              options={[
                { value: "operations", label: "Operations" },
                { value: "accounts", label: "Accounts" },
                { value: "administration", label: "Administration" },
              ]}
            />
          </Col>
          <Col span={8}>
            {/* Location */}
            <FormInputWrapper
              id="location"
              name="location"
              label="Location"
            // rules={[{ required: true, message: "Please input location" }]}
            />
          </Col>
          <Col span={8}>
            {/* Blood Group */}
            <FormSelectWrapper
              id="bloodGroup"
              name="bloodGroup"
              label="Blood Group"
              // rules={[{ required: true, message: "Please select blood group" }]}
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
            {/* Marital Status */}
            <FormSelectWrapper
              id="maritalStatus"
              name="maritalStatus"
              label="Marital Status"
              options={["single", "married", "divorced", "widowed"].map(
                (status) => ({
                  value: status,
                  label: status,
                })
              )}
            />
          </Col>
          <Col span={8}>
            {/* Gender */}
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
            {/* Tax Calculation */}
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
            {/* PAN Number */}
            <FormInputWrapper
              id="panNo"
              name="panNo"
              label="PAN No"
            />
          </Col>
          <Col span={8}>
            {/* Personal Contact Fields */}
            <FormInputWrapper
              id="contactNo"
              name="contactNo"
              label="Contact No"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="personalEmail"
              name="personalEmail"
              label="Personal Email"
              rules={[{ type: "email", message: "Please input valid email" }]}
            />
          </Col>
        </Row>
        <Title level={5}>Permanent Address Details</Title>
        <Row gutter={30}>
          <Col span={8}>
            {/* Permanent Address Fields */}
            <FormInputWrapper
              id="permanentAddressCountry"
              name="permanentAddressCountry"
              label="Permanent Address Country"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressState"
              name="permanentAddressState"
              label="Permanent Address State"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressDistrict"
              name="permanentAddressDistrict"
              label="Permanent Address District"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressLocalJurisdiction"
              name="permanentAddressLocalJurisdiction"
              label="Permanent Address Local Jurisdiction"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressWardNo"
              name="permanentAddressWardNo"
              label="Permanent Address Ward No"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="permanentAddressLocality"
              name="permanentAddressLocality"
              label="Permanent Address Locality"
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Title level={5}>Temporary Address Details</Title>
          </Col>
          <Col span={12}>
            <Checkbox>Same as Permanent Address</Checkbox>
          </Col>
        </Row>
        <Row gutter={30}>
          <Col span={8}>
            {/* Temporary Address Fields */}
            <FormInputWrapper
              id="temporaryAddressCountry"
              name="temporaryAddressCountry"
              label="Temporary Address Country"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressState"
              name="temporaryAddressState"
              label="Temporary Address State"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressDistrict"
              name="temporaryAddressDistrict"
              label="Temporary Address District"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressLocalJurisdiction"
              name="temporaryAddressLocalJurisdiction"
              label="Temporary Address Local Jurisdiction"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressWardNo"
              name="temporaryAddressWardNo"
              label="Temporary Address Ward No"
            />

          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="temporaryAddressLocality"
              name="temporaryAddressLocality"
              label="Temporary Address Locality"
            />
          </Col>
        </Row>
        <Title level={5}>Guardian Details</Title>
        <Row gutter={30}>
          <Col span={8}>
            {/* Guardian Fields */}
            <FormInputWrapper
              id="guardianName"
              name="guardianName"
              label="Guardian Name"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="guardianEmail"
              name="guardianRelation"
              label="Guardian Relation"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="guardianContact"
              name="guardianContact"
              label="Guardian Contact"
            />
          </Col>

          <Col span={8}>
            <FormInputWrapper
              id="alternateContactNo"
              name="alternateContactNo"
              label="Alternate Contact No"
            />
          </Col>
          <Col span={8}>
            {/* Leave Fields */}
            <FormInputWrapper
              id="casualLeaves"
              name="casualLeaves"
              label="Casual Leaves"
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="examLeaves"
              name="examLeaves"
              label="Exam Leaves"
            />
          </Col>
          <Col span={8}>
            <Form.Item name="maternityLeaves" label="Maternity Leaves">
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paternityLeaves" label="Paternity Leaves">
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="otherLeaves" label="Other Leaves">
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            {/* Benefits Section */}
            <Form.Item name="pf" label="Provident Fund" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        {/* Salary & Allowance Section */}
        <Title level={5}>Salary & Allowance Section</Title>
        <Row gutter={30}>
          <Col span={8}>
            <Form.Item name="hourlyCostRate" label="Hourly Cost Rate">
              <InputNumber min={0} step={0.01} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="publicHolidayAllowance"
              label="Public Holiday Allowance"
            >
              <InputNumber min={0} step={0.01} />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </>
  );
};

export default PersonalDetailForm;
