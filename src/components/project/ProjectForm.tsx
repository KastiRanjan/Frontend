
import { useCreateProject } from "@/hooks/project/useCreateProject";
import { useEditProject } from "@/hooks/project/useEditProject";
import { UserType } from "@/hooks/user/type";
import { useUser } from "@/hooks/user/useUser";
import { Button, Col, DatePicker, Divider, Form, Row, Select } from "antd";
import { useEffect, useState } from "react";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { fetchNatureOfWorks, NatureOfWork } from "@/service/natureOfWork.service";
import moment from "moment";
import { ProjectType } from "@/types/project";
import TextArea from "antd/es/input/TextArea";
import { useClient } from "@/hooks/client/useClient";
import { useBilling } from "@/hooks/billing/useBilling";

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
  
  // Add separate date states for edit mode - using strings instead of moment
  const [editStartDate, setEditStartDate] = useState<string | null>(null);
  const [editEndDate, setEditEndDate] = useState<string | null>(null);

  // Get the current project lead and manager value from the form
  const projectLead = Form.useWatch("projectLead", form);
  const projectManager = Form.useWatch("projectManager", form);

  // Suggest project name when client, nature of work, or fiscal year changes
  const handleFieldChange = () => {
    setTimeout(() => {
      const clientId = form.getFieldValue("client");
      const natureOfWorkId = form.getFieldValue("natureOfWork");
      const fiscalYear = form.getFieldValue("fiscalYear");
      
      if (clientId && natureOfWorkId && fiscalYear && clients && natureOfWorkOptions.length > 0) {
        const clientObj = clients.find((c: any) => c.id === clientId);
        const natureObj = natureOfWorkOptions.find((n: any) => n.value === natureOfWorkId);
        if (clientObj && natureObj) {
          const suggested = `${clientObj.shortName}-${natureObj.shortName}-${fiscalYear}`;
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
    // Ensure projectLead and projectManager are included in the users array
    const userIds = [values.projectLead, values.projectManager].filter(Boolean);
    
    // For edit mode, use our separate date states; for create mode, use form values
    const startDate = editProjectData ? editStartDate : values.startingDate;
    const endDate = editProjectData ? editEndDate : values.endingDate;
    
    // Transform dates to proper format for backend
    const transformedValues = {
      ...values,
      startingDate: startDate ? (typeof startDate === 'string' ? startDate : startDate.format('YYYY-MM-DD')) : null,
      endingDate: endDate ? (typeof endDate === 'string' ? endDate : endDate.format('YYYY-MM-DD')) : null,
      users: values.users
        ? [...new Set([...values.users, ...userIds])]
        : userIds,
    };

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
  }, [clients, natureOfWorkOptions]);

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
        };

        // Parse dates for edit mode state (store as strings)
        const parsedStartDate = parseDate(editProjectData.startingDate);
        const parsedEndDate = parseDate(editProjectData.endingDate);
        
        // Set edit date states as strings
        setEditStartDate(parsedStartDate ? parsedStartDate.format('YYYY-MM-DD') : null);
        setEditEndDate(parsedEndDate ? parsedEndDate.format('YYYY-MM-DD') : null);

        // DON'T add dates to form data in edit mode
        // We'll handle them separately with defaultValue

        // Clear form first, then set values
        form.resetFields();
        setTimeout(() => {
          form.setFieldsValue(formData);
        }, 50);
      }, 100);
    } else {
      form.resetFields();
      setEditStartDate(null);
      setEditEndDate(null);
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
              label: billing.name,
            }))}
            rules={[{ required: false, message: "Please select the billing entity!" }]}
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
                return [...Array(5).keys()].map((_, idx) => {
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
          <FormSelectWrapper
            id="users"
            name="users"
            label="Invite Users"
            placeholder="Select users"
            options={filteredUsers}
            mode="multiple"
          />
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
            label="Starting Date"
            name={editProjectData ? undefined : "startingDate"}
            rules={[
              { required: true, message: "Please select the starting date!" },
            ]}
          >
            <DatePicker 
              key={`startDate-${editProjectData?.id || 'new'}-${editStartDate || 'null'}`}
              className="py-3 w-full" 
              format="YYYY-MM-DD"
              placeholder="Select starting date"
              showToday={false}
              allowClear={true}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              style={{ width: '100%' }}
              defaultValue={editProjectData && editStartDate ? moment(editStartDate, 'YYYY-MM-DD') : undefined}
              onChange={(date) => {
                if (editProjectData) {
                  setEditStartDate(date ? date.format('YYYY-MM-DD') : null);
                } else {
                  // In create mode, let form handle it normally
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Ending Date"
            name={editProjectData ? undefined : "endingDate"}
            rules={[
              { required: true, message: "Please select the ending date!" },
            ]}
          >
            <DatePicker 
              key={`endDate-${editProjectData?.id || 'new'}-${editEndDate || 'null'}`}
              className="py-3 w-full" 
              format="YYYY-MM-DD"
              placeholder="Select ending date"
              showToday={false}
              allowClear={true}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              style={{ width: '100%' }}
              defaultValue={editProjectData && editEndDate ? moment(editEndDate, 'YYYY-MM-DD') : undefined}
              onChange={(date) => {
                if (editProjectData) {
                  setEditEndDate(date ? date.format('YYYY-MM-DD') : null);
                } else {
                  // In create mode, let form handle it normally
                }
              }}
            />
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