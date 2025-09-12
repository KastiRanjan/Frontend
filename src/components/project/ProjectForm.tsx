import { useCreateProject } from "@/hooks/project/useCreateProject";
import { useEditProject } from "@/hooks/project/useEditProject";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { Button, Col, Divider, Form, Row, Select } from "antd";
import { useEffect, useState } from "react";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { fetchNatureOfWorks, NatureOfWork } from "@/service/natureOfWork.service";
import moment from "moment";
import { ProjectType } from "@/types/project";
import TextArea from "antd/es/input/TextArea";
import { useClient } from "@/hooks/client/useClient";
import { useBilling } from "@/hooks/billing/useBilling";
import NepaliDatePicker, { NepaliDate } from "../NepaliDatePicker";
import dayjs from "dayjs";

// Improved AD<->BS conversion for frontend using the DualDateConverter
import { DualDateConverter } from "@/utils/dateConverter";

function adToBs(adDate: string): NepaliDate {
  try {
    const adDateObj = dayjs(adDate);
    if (!adDateObj.isValid()) {
      throw new Error('Invalid date format');
    }
    const dual = DualDateConverter.createDualDate(adDateObj);
    return {
      year: dual.nepali.getYear(),
      month: dual.nepali.getMonth() + 1,
      day: dual.nepali.getDate()
    };
  } catch (error) {
    console.error('Error converting AD to BS:', error);
    // Fallback to simple conversion
    const [year, month, day] = adDate.split("-").map(Number);
    return { year: year + 57, month, day };
  }
}

function formatNepaliDateForForm(nepaliDate: NepaliDate | undefined): string | null {
  if (!nepaliDate) return null;
  // Format as YYYY-MM-DD
  return `${nepaliDate.year}-${String(nepaliDate.month).padStart(2, '0')}-${String(nepaliDate.day).padStart(2, '0')}`;
}

interface ProjectFormProps {
  editProjectData?: ProjectType;
  handleCancel: () => void;
}

const ProjectForm = ({ editProjectData, handleCancel }: ProjectFormProps) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateProject();
  const { data: clients } = useClient();
  const { data: billings } = useBilling("active");
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditProject();
  const { data: users, isPending: isPendingUser } = useUser({
    status: "active",
    limit: 1000,
    page: 1,
    keywords: "",
  });
  const [natureOfWorkOptions, setNatureOfWorkOptions] = useState<{ value: string; label: string; shortName: string }[]>([]);
  const [suggestedProjectName, setSuggestedProjectName] = useState("");
  
  // Add state for Nepali dates only
  const [nepaliStartDate, setNepaliStartDate] = useState<NepaliDate | undefined>(undefined);
  const [nepaliEndDate, setNepaliEndDate] = useState<NepaliDate | undefined>(undefined);

  // Get the current project lead and manager value from the form
  const projectLead = Form.useWatch("projectLead", form);
  const projectManager = Form.useWatch("projectManager", form);

  // Suggest project name when client, nature of work, or fiscal year changes
  const handleFieldChange = () => {
    setTimeout(() => {
      const clientId = form.getFieldValue("client");
      const natureOfWorkId = form.getFieldValue("natureOfWork");
      const fiscalYear = form.getFieldValue("fiscalYear");
      const billingId = form.getFieldValue("billing");
      
      if (clientId && natureOfWorkId && fiscalYear && clients && natureOfWorkOptions.length > 0) {
        const clientObj = clients.find((c: any) => c.id === clientId);
        const natureObj = natureOfWorkOptions.find((n: any) => n.value === natureOfWorkId);
        const billingObj = billingId && billings ? billings.find((b: any) => b.id === billingId) : null;
        
        if (clientObj && natureObj) {
          // Format fiscal year as full format (e.g., 2082/83)
          const formattedFiscalYear = `${fiscalYear}/${(fiscalYear + 1).toString().slice(-2)}`;
          
          // Include billing short name at the end if available
          const billingSuffix = billingObj?.shortName ? `-${billingObj.shortName}` : '';
          const suggested = `${clientObj.shortName}-${natureObj.shortName}-${formattedFiscalYear}${billingSuffix}`;
          setSuggestedProjectName(suggested);
          // Only set if name field is empty or contains the old suggested name
          const currentName = form.getFieldValue("name");
          if (!currentName || currentName === suggestedProjectName || currentName.includes("-")) {
            form.setFieldsValue({ name: suggested });
          }
        }
      }
    }, 100);
  };

  const onFinish = (values: any) => {
    // Log all form values for debugging
    console.log('Form values on submit:', values);
    console.log('Current nepali dates state:', { 
      nepaliStartDate, 
      nepaliEndDate,
      formattedNepaliStart: formatNepaliDateForForm(nepaliStartDate),
      formattedNepaliEnd: formatNepaliDateForForm(nepaliEndDate)
    });
    
    // Ensure projectLead and projectManager are included in the users array
    const userIds = [values.projectLead, values.projectManager].filter(Boolean);
    
    // Get dates from either form values or component state
    let startDate = values.startingDate;
    let endDate = values.endingDate;
    
    // First priority: use explicit English date fields
    if (values.startingDateEnglish) {
      startDate = values.startingDateEnglish;
      console.log('Using explicit English start date:', startDate);
    }
    // Second priority: convert from Nepali date in form values
    else if (values.startingDateNepali) {
      try {
        // Check if it's already a string (from form) or an object (from state)
        if (typeof values.startingDateNepali === 'string') {
          startDate = DualDateConverter.convertToAD(values.startingDateNepali);
        } else {
          // Format the object to string first
          const nepaliDateStr = formatNepaliDateForForm(values.startingDateNepali);
          if (nepaliDateStr) {
            startDate = DualDateConverter.convertToAD(nepaliDateStr);
          }
        }
        console.log('Converted Nepali start date from form:', startDate);
      } catch (error) {
        console.error('Failed to convert start date from form:', error);
      }
    }
    // Third priority: use state-based conversion
    else if (nepaliStartDate) {
      try {
        const nepaliDateStr = formatNepaliDateForForm(nepaliStartDate);
        if (nepaliDateStr) {
          startDate = DualDateConverter.convertToAD(nepaliDateStr);
          console.log('Using state-based start date conversion:', startDate);
        }
      } catch (error) {
        console.error('Failed to convert start date from state:', error);
      }
    }
    
    // Similar approach for end date
    if (values.endingDateEnglish) {
      endDate = values.endingDateEnglish;
      console.log('Using explicit English end date:', endDate);
    }
    else if (values.endingDateNepali) {
      try {
        if (typeof values.endingDateNepali === 'string') {
          endDate = DualDateConverter.convertToAD(values.endingDateNepali);
        } else {
          const nepaliDateStr = formatNepaliDateForForm(values.endingDateNepali);
          if (nepaliDateStr) {
            endDate = DualDateConverter.convertToAD(nepaliDateStr);
          }
        }
        console.log('Converted Nepali end date from form:', endDate);
      } catch (error) {
        console.error('Failed to convert end date from form:', error);
      }
    }
    else if (nepaliEndDate) {
      try {
        const nepaliDateStr = formatNepaliDateForForm(nepaliEndDate);
        if (nepaliDateStr) {
          endDate = DualDateConverter.convertToAD(nepaliDateStr);
          console.log('Using state-based end date conversion:', endDate);
        }
      } catch (error) {
        console.error('Failed to convert end date from state:', error);
      }
    }
    
    // Final validation to ensure we have dates
    if (!startDate || startDate === '') {
      console.error('Missing starting date, form validation should catch this');
      return; // Let the form validation handle this
    }
    
    if (!endDate || endDate === '') {
      console.error('Missing ending date, form validation should catch this');
      return; // Let the form validation handle this
    }
    
    // Transform dates to proper format for backend
    const transformedValues = {
      ...values,
      startingDate: startDate,
      endingDate: endDate,
      users: values.users
        ? [...new Set([...values.users, ...userIds])]
        : userIds,
    };
    
    // Remove Nepali date fields before sending to backend
    delete transformedValues.startingDateNepali;
    delete transformedValues.endingDateNepali;
    delete transformedValues.startingDateEnglish;
    delete transformedValues.endingDateEnglish;

    console.log('Submitting project with dates:', { 
      startingDate: startDate, 
      endingDate: endDate
    });

    if (editProjectData?.id) {
      mutateEdit(
        { id: editProjectData.id, payload: transformedValues },
        { onSuccess: () => handleCancel() }
      );
    } else {
      mutate(transformedValues, { onSuccess: () => handleCancel() });
    }
  };

  // Filter out the project lead and manager from available users for the "Invite Users" field
  const filteredUsers = isPendingUser
    ? []
    : users?.results
        ?.filter((user: UserType) => user.id !== projectLead && user.id !== projectManager)
        ?.map((user: UserType) => ({
          value: user.id,
          label: user.name,
        })) || [];

  // Filter users with role 'manager' for Project Manager field
  const managerOptions = isPendingUser
    ? []
    : users?.results
        ?.filter((user: UserType) => user.role?.name?.toLowerCase() === "projectmanager")
        ?.map((user: UserType) => ({
          value: user.id,
          label: user.name,
        })) || [];


  useEffect(() => {
    // Fetch nature of work options from backend
    fetchNatureOfWorks().then((data: NatureOfWork[]) => {
      setNatureOfWorkOptions(
        data.map((item) => ({ value: item.id, label: `${item.name} (${item.shortName})`, shortName: item.shortName }))
      );
    });
  }, []);

  // Trigger name suggestion when dependencies change
  useEffect(() => {
    handleFieldChange();
  }, [clients, natureOfWorkOptions, billings]);

  useEffect(() => {
    if (editProjectData) {
      // Helper function to safely parse dates and create new moment instances
      const parseDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        try {
          // Extract just the date part if it's a full datetime string
          const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
          // Create a completely new moment instance with UTC to avoid timezone issues
          const date = moment.utc(dateOnly, 'YYYY-MM-DD', true);
          
          if (date.isValid()) {
            // Convert to local time and clone to ensure independence
            return date.local().clone();
          }
          
          // Fallback: try different formats
          const fallbackDate = moment.utc(dateOnly).local();
          return fallbackDate.isValid() ? fallbackDate.clone() : null;
        } catch (error) {
          console.warn('Invalid date format:', dateStr);
          return null;
        }
      };

      // Set form values with a delay to ensure form is ready
      setTimeout(() => {
        // Parse dates for edit mode
        const parsedStartDate = parseDate(editProjectData.startingDate);
        const parsedEndDate = parseDate(editProjectData.endingDate);
        
        // Get the AD dates as strings for the form
        const startDateAD = parsedStartDate ? parsedStartDate.format('YYYY-MM-DD') : '';
        const endDateAD = parsedEndDate ? parsedEndDate.format('YYYY-MM-DD') : '';
        
        // Convert to Nepali dates if we have valid Gregorian dates
        if (parsedStartDate) {
          try {
            const adDate = parsedStartDate.format('YYYY-MM-DD');
            const bsDate = adToBs(adDate);
            setNepaliStartDate(bsDate);
            console.log('Setting Nepali start date in edit mode:', bsDate);
          } catch (error) {
            console.error('Error converting start date to BS in edit mode:', error);
          }
        }
        
        if (parsedEndDate) {
          try {
            const adDate = parsedEndDate.format('YYYY-MM-DD');
            const bsDate = adToBs(adDate);
            setNepaliEndDate(bsDate);
            console.log('Setting Nepali end date in edit mode:', bsDate);
          } catch (error) {
            console.error('Error converting end date to BS in edit mode:', error);
          }
        }

        // Create form data object
        const formData: any = {
          name: editProjectData.name || '',
          description: editProjectData.description || '',
          status: editProjectData.status || 'active',
          fiscalYear: editProjectData.fiscalYear,
          users: editProjectData.users?.map((user: any) => user.id) || [],
          projectLead: editProjectData.projectLead?.id,
          projectManager: editProjectData.projectManager?.id,
          client: (editProjectData as any).client?.id || (editProjectData as any).customer?.id || (editProjectData as any).client || (editProjectData as any).customer,
          billing: (editProjectData as any).billing?.id || (editProjectData as any).billing,
          natureOfWork: typeof editProjectData.natureOfWork === "string" ? editProjectData.natureOfWork : (editProjectData.natureOfWork as any)?.id,
          
          // Set both date formats to ensure synchronization
          startingDate: startDateAD,
          endingDate: endDateAD,
          
          // Also set English date fields explicitly
          startingDateEnglish: startDateAD,
          endingDateEnglish: endDateAD
        };

        // Clear form first, then set values
        form.resetFields();
        
        setTimeout(() => {
          // Set the form values first
          form.setFieldsValue(formData);
          
          // Then update the Nepali date form fields
          if (nepaliStartDate) {
            form.setFieldsValue({ startingDateNepali: nepaliStartDate });
            console.log('Set startingDateNepali in form:', nepaliStartDate);
          }
          
          if (nepaliEndDate) {
            form.setFieldsValue({ endingDateNepali: nepaliEndDate });
            console.log('Set endingDateNepali in form:', nepaliEndDate);
          }
          
          // Log the form values after setting them
          console.log('Form values after initialization:', form.getFieldsValue());
          
          // Force form validation
          form.validateFields(['startingDateNepali', 'endingDateNepali'])
            .then(() => console.log('Initial validation passed'))
            .catch(err => console.log('Initial validation error:', err));
        }, 100);
      }, 200);
    } else {
      // For new project, reset form and initialize with today's date
      form.resetFields();
      
      // Get today's date in Nepali
      const todayNepali = adToBs(new Date().toISOString().split('T')[0]);
      setNepaliStartDate(todayNepali);
      setNepaliEndDate(todayNepali);
      
      // Format the Nepali date for conversion
      const nepaliDateStr = formatNepaliDateForForm(todayNepali);
      
      // Set the form values for new project
      setTimeout(() => {
        if (nepaliDateStr) {
          try {
            const adDate = DualDateConverter.convertToAD(nepaliDateStr);
            form.setFieldsValue({ 
              startingDateNepali: todayNepali,
              startingDate: adDate,
              startingDateEnglish: adDate,
              endingDateNepali: todayNepali,
              endingDate: adDate,
              endingDateEnglish: adDate
            });
            console.log('Set default dates for new project:', { todayNepali, adDate });
            
            // Force form validation
            form.validateFields(['startingDateNepali', 'endingDateNepali'])
              .then(() => console.log('Initial validation passed'))
              .catch(err => console.log('Initial validation error:', err));
          } catch (error) {
            console.error('Error setting default dates:', error);
          }
        }
      }, 200);
    }
  }, [editProjectData, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Row gutter={18}>
        <Divider />
        <Col span={12}>
          <FormSelectWrapper
            id="Client"
            label="Client"
            name="client"
            options={clients?.map((client: any) => ({
              value: client.id,
              label: `${client.name} (${client.shortName})`,
            }))}
            rules={[{ required: true, message: "Please select the client!" }]}
            changeHandler={handleFieldChange}
          />
        </Col>
        <Col span={12}>
          <FormSelectWrapper
            id="Billing"
            label="Billing Entity"
            name="billing"
            options={billings?.map((billing: any) => ({
              value: billing.id,
              label: `${billing.name}${billing.shortName ? ` (${billing.shortName})` : ''}`,
            }))}
            rules={[{ required: false, message: "Please select the billing entity!" }]}
            changeHandler={handleFieldChange}
          />
        </Col>
        <Col span={12}>
          <Form.Item
            label="Fiscal Year"
            name="fiscalYear"
            rules={[
              { required: true, message: "Please select the fiscal year!" },
            ]}
          >
            <Select
              className="h-[48px] w-full"
              onChange={handleFieldChange}
              options={(() => {
                // Get current Nepali year (roughly, adjust as needed)
                const today = new Date();
                // Example: Nepali year is about 56-57 years ahead of AD
                const nepaliYear = today.getFullYear() + 57;
                // Generate fiscal years for the last 20 years
                return [...Array(20).keys()].map((_, idx) => {
                  const startYear = nepaliYear - idx;
                  const endYear = (startYear + 1).toString().slice(-2);
                  return {
                    value: startYear,
                    label: `${startYear}/${endYear}`,
                  };
                });
              })()}
            />
          </Form.Item>
        </Col>
  {/* Project Name will be moved to the bottom */}
        <Col span={12}>
          <FormSelectWrapper
            id="projectLead"
            name="projectLead"
            label="Project Lead"
            placeholder="Select users"
            options={
              isPendingUser
                ? []
                : users?.results?.map((user: UserType) => ({
                    value: user.id,
                    label: user.name,
                  }))
            }
            rules={[
              { required: true, message: "Please select a project lead!" },
            ]}
          />
        </Col>
        <Col span={12}>
          <FormSelectWrapper
            id="projectManager"
            name="projectManager"
            label="Project Manager"
            placeholder="Select project manager"
            options={managerOptions}
            rules={[
              { required: true, message: "Please select a project manager!" },
            ]}
          />
        </Col>
        <Col span={12}>
          <Form.Item
            label="Invite Users"
            name="users"
            className="user-select-field"
          >
            <Select
              placeholder="Select users"
              options={filteredUsers}
              mode="multiple"
              style={{ width: '100%' }}
              optionFilterProp="label"
              showSearch
              allowClear
              maxTagCount="responsive"
              virtual={false}
              filterOption={(input, option) =>
                option?.label && typeof option.label === 'string' 
                  ? option.label.toLowerCase().includes(input.toLowerCase())
                  : false
              }
            />
          </Form.Item>
        </Col>

        {/* Rest of the form fields remain unchanged */}
        <Col span={12}>
          <FormSelectWrapper
            id="Nature of Work"
            label="Nature of Work"
            name="natureOfWork"
            options={natureOfWorkOptions}
            rules={[
              {
                required: true,
                message: "Please select the nature of work!",
              },
            ]}
            changeHandler={handleFieldChange}
          />
        </Col>
        <Col span={12}>
          <Form.Item
            label="Starting Date (BS)"
            name="startingDateNepali"
            initialValue={nepaliStartDate}
            rules={[
              { 
                required: true, 
                message: "Please select the starting date!",
                validator: (_, value) => {
                  // Debug validation
                  console.log("Validating startingDateNepali:", value, nepaliStartDate);
                  if (value || nepaliStartDate) {
                    // Add fallback synchronization when validation runs
                    if (!value && nepaliStartDate) {
                      // If form value is empty but we have state, update the form
                      const formattedDate = formatNepaliDateForForm(nepaliStartDate);
                      if (formattedDate) {
                        // Schedule update for next tick to avoid validation cycle
                        setTimeout(() => {
                          form.setFieldsValue({ 
                            startingDateNepali: nepaliStartDate,
                            startingDate: DualDateConverter.convertToAD(formattedDate),
                          });
                        }, 0);
                      }
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please select the starting date!"));
                }
              },
            ]}
          >
            <NepaliDatePicker
              value={nepaliStartDate}
              onChange={bs => {
                setNepaliStartDate(bs);
                try {
                  // Format the Nepali date for conversion
                  const nepaliDateStr = formatNepaliDateForForm(bs);
                  if (nepaliDateStr) {
                    const adDate = DualDateConverter.convertToAD(nepaliDateStr);
                    console.log("Converted starting date (AD):", adDate);
                    // Set both form fields
                    form.setFieldsValue({ 
                      startingDateNepali: bs, 
                      startingDate: adDate,
                      startingDateEnglish: adDate  // Make sure the hidden English field is set
                    });
                    // Add a delay to allow form to update
                    setTimeout(() => {
                      console.log("Form values after date change:", form.getFieldsValue());
                    }, 100);
                  }
                } catch (error) {
                  console.error("Error converting start date to AD:", error);
                }
              }}
            />
          </Form.Item>
          {/* Hidden field to store the AD date */}
          <Form.Item
            name="startingDate"
            hidden={true}
          >
            <input type="hidden" />
          </Form.Item>
          {/* Additional hidden field for explicit English date */}
          <Form.Item
            name="startingDateEnglish"
            hidden={true}
          >
            <input type="hidden" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Ending Date (BS)"
            name="endingDateNepali"
            initialValue={nepaliEndDate}
            rules={[
              { 
                required: true, 
                message: "Please select the ending date!",
                validator: (_, value) => {
                  console.log("Validating endingDateNepali:", value, nepaliEndDate);
                  if (value || nepaliEndDate) {
                    // Add fallback synchronization when validation runs
                    if (!value && nepaliEndDate) {
                      // If form value is empty but we have state, update the form
                      const formattedDate = formatNepaliDateForForm(nepaliEndDate);
                      if (formattedDate) {
                        // Schedule update for next tick to avoid validation cycle
                        setTimeout(() => {
                          form.setFieldsValue({ 
                            endingDateNepali: nepaliEndDate,
                            endingDate: DualDateConverter.convertToAD(formattedDate),
                          });
                        }, 0);
                      }
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please select the ending date!"));
                }
              },
            ]}
          >
            <NepaliDatePicker
              value={nepaliEndDate}
              onChange={bs => {
                setNepaliEndDate(bs);
                try {
                  // Format the Nepali date for conversion
                  const nepaliDateStr = formatNepaliDateForForm(bs);
                  if (nepaliDateStr) {
                    const adDate = DualDateConverter.convertToAD(nepaliDateStr);
                    console.log("Converted ending date (AD):", adDate);
                    // Set both form fields
                    form.setFieldsValue({ 
                      endingDateNepali: bs, 
                      endingDate: adDate,
                      endingDateEnglish: adDate  // Make sure the hidden English field is set
                    });
                    // Add a delay to allow form to update
                    setTimeout(() => {
                      console.log("Form values after date change:", form.getFieldsValue());
                    }, 100);
                  }
                } catch (error) {
                  console.error("Error converting end date to AD:", error);
                }
              }}
            />
          </Form.Item>
          {/* Hidden field to store the AD date */}
          <Form.Item
            name="endingDate"
            hidden={true}
          >
            <input type="hidden" />
          </Form.Item>
          {/* Additional hidden field for explicit English date */}
          <Form.Item
            name="endingDateEnglish"
            hidden={true}
          >
            <input type="hidden" />
          </Form.Item>
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
              { value: "signed_off", label: "Signed Off" },
            ]}
            rules={[{ required: true, message: "Please select the status!" }]}
          />
        </Col>
        <Col span={24}>
          <Form.Item
            id="Description"
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Col>
      {/* Move Project Name to the bottom */}
      <Col span={24}>
        <FormInputWrapper
          id="Project Name"
          label="Project Name"
          name="name"
          rules={[
            { required: true, message: "Please input the project name!" },
          ]}
          placeholder="Project name will be auto-generated or you can enter manually"
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

export default ProjectForm;