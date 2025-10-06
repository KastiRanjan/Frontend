import { Card, Button, Checkbox, Col, Form, InputNumber, Row, Switch, message, Select, DatePicker } from "antd";
import Title from "antd/es/typography/Title";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useCreateUserDetail } from "@/hooks/user/userCreateuserDetail";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  countries, 
  getStateOptions, 
  getDistrictOptions, 
  getLocalJurisdictionOptions 
} from "@/utils/locationData";
import { fetchDepartments, Department } from "@/service/department.service";

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
  dateOfBirth?: string;
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
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // State for cascading address dropdowns
  const [permanentCountry, setPermanentCountry] = useState<string | null>(
    initialValues?.permanentAddressCountry || null
  );
  const [permanentState, setPermanentState] = useState<string | null>(
    initialValues?.permanentAddressState || null
  );
  const [permanentDistrict, setPermanentDistrict] = useState<string | null>(
    initialValues?.permanentAddressDistrict || null
  );
  
  const [temporaryCountry, setTemporaryCountry] = useState<string | null>(
    initialValues?.temporaryAddressCountry || null
  );
  const [temporaryState, setTemporaryState] = useState<string | null>(
    initialValues?.temporaryAddressState || null
  );
  const [temporaryDistrict, setTemporaryDistrict] = useState<string | null>(
    initialValues?.temporaryAddressDistrict || null
  );
  
  // Fetch departments when component mounts
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departmentData = await fetchDepartments();
        setDepartments(departmentData);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        message.error("Failed to load departments");
      }
    };
    
    loadDepartments();
  }, []);
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
        <Row gutter={16}>
          <Col span={8}>
            <FormSelectWrapper
              id="department"
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select a department!" }]}
              options={departments.map(dept => ({ value: dept.id, label: dept.name }))}
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
          <Col span={8}>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[
                {message: "Please select date of birth!" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const today = new Date();
                    if (value && value > today) {
                      return Promise.reject(new Error("Date of birth cannot be in the future!"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <Title level={4}>Permanent Address Details</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="permanentAddressCountry"
              label="Country"
              rules={[{ required: true, message: "Please select country!" }]}
            >
              <Select
                placeholder="Select country"
                options={countries}
                onChange={(value) => {
                  setPermanentCountry(value);
                  form.setFieldsValue({ 
                    permanentAddressState: undefined, 
                    permanentAddressDistrict: undefined, 
                    permanentAddressLocalJurisdiction: undefined 
                  });
                  setPermanentState(null);
                  setPermanentDistrict(null);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="permanentAddressState"
              label="State/Province"
              rules={[{ required: true, message: "Please select state!" }]}
            >
              <Select
                placeholder="Select state"
                options={permanentCountry ? getStateOptions(permanentCountry) : []}
                disabled={!permanentCountry}
                onChange={(value) => {
                  setPermanentState(value);
                  form.setFieldsValue({ 
                    permanentAddressDistrict: undefined, 
                    permanentAddressLocalJurisdiction: undefined 
                  });
                  setPermanentDistrict(null);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="permanentAddressDistrict"
              label="District"
              rules={[{ required: true, message: "Please select district!" }]}
            >
              <Select
                placeholder="Select district"
                options={permanentState ? getDistrictOptions(permanentState) : []}
                disabled={!permanentState}
                onChange={(value) => {
                  setPermanentDistrict(value);
                  form.setFieldsValue({ permanentAddressLocalJurisdiction: undefined });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="permanentAddressLocalJurisdiction"
              label="Local Jurisdiction"
              rules={[{ required: true, message: "Please select local jurisdiction!" }]}
            >
              <Select
                placeholder="Select local jurisdiction"
                options={permanentDistrict ? getLocalJurisdictionOptions(permanentDistrict) : []}
                disabled={!permanentDistrict}
              />
            </Form.Item>
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
            <Form.Item
              name="temporaryAddressCountry"
              label="Country"
              rules={[{ required: !sameAsPermanent, message: "Please select country!" }]}
            >
              <Select
                placeholder="Select country"
                options={countries}
                disabled={sameAsPermanent}
                onChange={(value) => {
                  setTemporaryCountry(value);
                  form.setFieldsValue({ 
                    temporaryAddressState: undefined, 
                    temporaryAddressDistrict: undefined, 
                    temporaryAddressLocalJurisdiction: undefined 
                  });
                  setTemporaryState(null);
                  setTemporaryDistrict(null);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="temporaryAddressState"
              label="State/Province"
              rules={[{ required: !sameAsPermanent, message: "Please select state!" }]}
            >
              <Select
                placeholder="Select state"
                options={temporaryCountry ? getStateOptions(temporaryCountry) : []}
                disabled={sameAsPermanent || !temporaryCountry}
                onChange={(value) => {
                  setTemporaryState(value);
                  form.setFieldsValue({ 
                    temporaryAddressDistrict: undefined, 
                    temporaryAddressLocalJurisdiction: undefined 
                  });
                  setTemporaryDistrict(null);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="temporaryAddressDistrict"
              label="District"
              rules={[{ required: !sameAsPermanent, message: "Please select district!" }]}
            >
              <Select
                placeholder="Select district"
                options={temporaryState ? getDistrictOptions(temporaryState) : []}
                disabled={sameAsPermanent || !temporaryState}
                onChange={(value) => {
                  setTemporaryDistrict(value);
                  form.setFieldsValue({ temporaryAddressLocalJurisdiction: undefined });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="temporaryAddressLocalJurisdiction"
              label="Local Jurisdiction"
              rules={[{ required: !sameAsPermanent, message: "Please select local jurisdiction!" }]}
            >
              <Select
                placeholder="Select local jurisdiction"
                options={temporaryDistrict ? getLocalJurisdictionOptions(temporaryDistrict) : []}
                disabled={sameAsPermanent || !temporaryDistrict}
              />
            </Form.Item>
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