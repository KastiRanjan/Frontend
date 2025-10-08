import { Card, Button, Checkbox, Col, Form, InputNumber, Row, Switch, message, Select, DatePicker } from "antd";
import dayjs from 'dayjs';
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
  dateOfBirth?: any; // Allow for either moment object or string
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
  const [permanentCountry, setPermanentCountry] = useState<string | null>(null);
  const [permanentState, setPermanentState] = useState<string | null>(null);
  const [permanentDistrict, setPermanentDistrict] = useState<string | null>(null);
  
  const [temporaryCountry, setTemporaryCountry] = useState<string | null>(null);
  const [temporaryState, setTemporaryState] = useState<string | null>(null);
  const [temporaryDistrict, setTemporaryDistrict] = useState<string | null>(null);
  
  // Update local state when initialValues change
  useEffect(() => {
    console.log('PersonalDetailForm initialValues:', initialValues);
    
    if (initialValues) {
      setPermanentCountry(initialValues.permanentAddressCountry || null);
      setPermanentState(initialValues.permanentAddressState || null);
      setPermanentDistrict(initialValues.permanentAddressDistrict || null);
      
      setTemporaryCountry(initialValues.temporaryAddressCountry || null);
      setTemporaryState(initialValues.temporaryAddressState || null);
      setTemporaryDistrict(initialValues.temporaryAddressDistrict || null);
      
      // Convert date string to dayjs object if it exists
      const formValues = {...initialValues};
      
      if (formValues.dateOfBirth) {
        try {
          // Parse the string date into a dayjs object
          const dateObj = dayjs(formValues.dateOfBirth);
          // Check if the date is valid
          if (dateObj.isValid()) {
            formValues.dateOfBirth = dateObj;
            console.log('Converted date of birth to dayjs object:', dateObj.format('YYYY-MM-DD'));
          } else {
            console.warn('Invalid date of birth format:', initialValues.dateOfBirth);
            formValues.dateOfBirth = undefined;
          }
        } catch (error) {
          console.error('Error parsing date of birth:', error);
          formValues.dateOfBirth = undefined;
        }
      }
      
      // Initialize form fields with processed initial values
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);
  
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
    // Create a new object with only the non-empty/defined values
    const cleanedValues: Record<string, any> = {};
    
    // Process each field, only including values that are not null/undefined/empty strings
    Object.entries(values).forEach(([key, value]) => {
      // Don't include empty values except for required fields
      if (value !== null && value !== undefined && value !== '') {
        cleanedValues[key] = value;
      }
    });

    // Department is required, so ensure it's included
    if (!cleanedValues.department && values.department) {
      cleanedValues.department = values.department;
    }
    
    // If "Same as Permanent Address" is checked, copy permanent address fields
    if (sameAsPermanent) {
      cleanedValues.temporaryAddressCountry = cleanedValues.permanentAddressCountry;
      cleanedValues.temporaryAddressState = cleanedValues.permanentAddressState;
      cleanedValues.temporaryAddressDistrict = cleanedValues.permanentAddressDistrict;
      cleanedValues.temporaryAddressLocalJurisdiction = cleanedValues.permanentAddressLocalJurisdiction;
      cleanedValues.temporaryAddressWardNo = cleanedValues.permanentAddressWardNo;
      cleanedValues.temporaryAddressLocality = cleanedValues.permanentAddressLocality;
    }

    // For dateOfBirth, ensure it's in the correct format if present
    if (cleanedValues.dateOfBirth) {
      try {
        // Check if it's a dayjs object or has format method
        if (cleanedValues.dateOfBirth && typeof cleanedValues.dateOfBirth === 'object' && typeof cleanedValues.dateOfBirth.format === 'function') {
          console.log('Date appears to be a dayjs object');
          cleanedValues.dateOfBirth = cleanedValues.dateOfBirth.format('YYYY-MM-DD');
        } else if (typeof cleanedValues.dateOfBirth === 'string') {
          // If it's already a string, validate it's a proper date string
          const dateObj = dayjs(cleanedValues.dateOfBirth);
          if (dateObj.isValid()) {
            cleanedValues.dateOfBirth = dateObj.format('YYYY-MM-DD');
          } else {
            // Invalid date, remove it
            console.warn('Invalid date string detected:', cleanedValues.dateOfBirth);
            delete cleanedValues.dateOfBirth;
          }
        } else {
          // Not a valid date format, remove it
          console.warn('Unknown date format detected:', typeof cleanedValues.dateOfBirth);
          delete cleanedValues.dateOfBirth;
        }
      } catch (error) {
        console.error('Error processing date:', error);
        delete cleanedValues.dateOfBirth;
      }
    }

    console.log("Submitting profile data:", cleanedValues);
    
    mutate({id, payload: cleanedValues, query: "profile"}, {
      onSuccess: () => {
        message.success("User details saved successfully!");
        // Refetch user details so parent gets latest data
        queryClient.invalidateQueries({ queryKey: ["users", id] });
      },
      onError: (error: any) => {
        console.error("Profile update error:", error);
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
            />
          </Col>
          <Col span={8}>
            <FormInputWrapper
              id="contactNo"
              name="contactNo"
              label="Contact No"
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
              id="personalEmail"
              name="personalEmail"
              label="Personal Email"
              rules={[
                { type: "email", message: "Please input a valid email!" },
              ]}
            />
          </Col>
          <Col span={8}>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    
                    // For dayjs objects or values that can be converted to dayjs
                    try {
                      // Check if it's already a dayjs object
                      const isValidDate = value && typeof value === 'object' && typeof value.isValid === 'function' ? 
                        value.isValid() : dayjs(value).isValid();
                      
                      if (!isValidDate) {
                        return Promise.reject(new Error("Please enter a valid date"));
                      }
                      
                      // Get dayjs object
                      const dateValue = value && typeof value === 'object' && typeof value.isValid === 'function' ? 
                        value : dayjs(value);
                      
                      // Check if it's in the future
                      const today = dayjs();
                      if (dateValue.isAfter(today)) {
                        return Promise.reject(new Error("Date of birth cannot be in the future!"));
                      }
                      
                      return Promise.resolve();
                    } catch (error) {
                      console.error('Date validation error:', error);
                      return Promise.reject(new Error("Invalid date format"));
                    }
                  },
                },
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="YYYY-MM-DD" 
                placeholder="Select date of birth"
                allowClear
                onChange={(date) => {
                  console.log('DatePicker onChange:', date);
                }}
                // Using strictMode to be more strict on date parsing
                showToday={false}
              />
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