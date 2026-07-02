import ProjectForm from "@/components/project/ProjectForm";
import ProjectTable from "@/components/project/ProjectTable";
import { ProjectType } from "@/types/project";
import { Modal, Tabs, Button, Space, Tooltip, Card, Form, Row, Col, DatePicker, Select } from "antd";
import React, { useCallback, useState } from "react";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { useDeleteProject } from "@/hooks/project/useDeleteProject";
import { useSession } from "@/context/SessionContext";
import { useProject } from "@/hooks/project/useProject";

const ProjectPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editTaskGroupData, setEditTaskGroupData] = useState<ProjectType | undefined>(undefined);
  
  // Lifted state
  const [selectedProjects, setSelectedProjects] = useState<ProjectType[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [form] = Form.useForm();
  
  const deleteProjectMutation = useDeleteProject();
  const { profile } = useSession();
  
  const userRole = (profile as any)?.role?.name?.toLowerCase();
  const hideCreateDelete = userRole === "auditsenior" || userRole === "auditjunior";

  const { data: allProjects } = useProject({ status: 'all' });

  const applyFilters = (values: any) => {
    setAdvancedFilters(values);
  };

  const resetFilters = () => {
    form.resetFields();
    setAdvancedFilters({});
  };

  const handleDeleteSelected = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete these projects?',
      content: `This will delete ${selectedProjects.length} project(s).`,
      okText: 'Yes, delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        const ids = selectedProjects.map(p => p.id).filter(id => id !== undefined) as number[];
        ids.forEach(id => {
          deleteProjectMutation.mutate({ id: id.toString() });
        });
        setSelectedProjects([]);
      },
    });
  };

  const showModal = useCallback((project?: ProjectType) => {
    setEditTaskGroupData(project);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditTaskGroupData(undefined);
    setOpen(false);
  }, []);

  return (
    <>
      

      <Tabs
        onChange={(key) => {
          if (showFilters) {
            setShowFilters(false);
            resetFilters();
          }
        }}
        renderTabBar={(props, DefaultTabBar) => (
          <>
            <DefaultTabBar {...props} />
            {showFilters && (
        <Card className="mb-4">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={applyFilters}
            initialValues={{}}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="dateRange" label="Date Range">
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="clientId" label="Client">
                  <Select 
                    placeholder="Select client"
                    allowClear
                    options={allProjects?.map((p: any) => ({
                      label: p.customer?.name,
                      value: p.customer?.id
                    })).filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.value === v.value) === i)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectLeadId" label="Project Lead">
                  <Select 
                    placeholder="Select project lead"
                    allowClear
                    options={allProjects?.map((p: any) => ({
                      label: p.projectLead?.name,
                      value: p.projectLead?.id
                    })).filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.value === v.value) === i)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="mt-4">
              <Col span={8}>
                <Form.Item name="projectManagerId" label="Project Manager">
                  <Select 
                    placeholder="Select project manager"
                    allowClear
                    options={allProjects?.map((p: any) => ({
                      label: p.projectManager?.name,
                      value: p.projectManager?.id
                    })).filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.value === v.value) === i)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="natureOfWork" label="Nature of Work">
                  <Select 
                    placeholder="Select nature of work"
                    allowClear
                    options={allProjects?.map((p: any) => {
                      const name = typeof p.natureOfWork === 'object' ? p.natureOfWork?.name : p.natureOfWork;
                      const id = typeof p.natureOfWork === 'object' ? p.natureOfWork?.id : p.natureOfWork;
                      return { label: name, value: id };
                    }).filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.value === v.value) === i)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="Status">
                  <Select 
                    placeholder="Select status"
                    allowClear
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Suspended", value: "suspended" },
                      { label: "Archived", value: "archived" },
                      { label: "Signed Off", value: "signed_off" },
                      { label: "Completed", value: "completed" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="flex justify-end mt-4">
              <Button style={{ marginRight: 8 }} onClick={resetFilters}>
                Reset
              </Button>
              <Button type="primary" htmlType="submit">
                Apply Filters
              </Button>
            </div>
          </Form>
        </Card>
      )}
          </>
        )}

        defaultActiveKey="1"
        tabBarExtraContent={
          <Space size={10}>
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => {
                if (showFilters) resetFilters();
                setShowFilters(!showFilters);
              }}
              type={showFilters ? "primary" : "default"}
            >
              Advanced Filters
            </Button>
            {!hideCreateDelete && (
              <Button
                danger
                loading={deleteProjectMutation.isPending}
                disabled={selectedProjects.length === 0}
                onClick={handleDeleteSelected}
              >
                Delete
              </Button>
            )}
            <Tooltip title="Download">
              <Button>
                <DownloadOutlined />
              </Button>
            </Tooltip>
            {!hideCreateDelete && (
              <Button type="primary" onClick={() => showModal()}>
                Create Project
              </Button>
            )}
          </Space>
        }
        items={[
          
          {
            label: `Active`,
            key: "1",
            children: <ProjectTable showModal={showModal} status="active" advancedFilters={advancedFilters} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} showFilters={showFilters} />,
          },
          {
            label: `Completed`,
            key: "2",
            children: <ProjectTable showModal={showModal} status="completed" advancedFilters={advancedFilters} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} showFilters={showFilters} />,
          },
          {
            label: `Signed Off`,
            key: "3",
            children: <ProjectTable showModal={showModal} status="signed_off" advancedFilters={advancedFilters} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} showFilters={showFilters} />,
          },
          {
            label: `Suspended`,
            key: "4",
            children: <ProjectTable showModal={showModal} status="suspended" advancedFilters={advancedFilters} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} showFilters={showFilters} />,
          },
          {
            label: `Archived`,
            key: "5",
            children: <ProjectTable showModal={showModal} status="archive" advancedFilters={advancedFilters} selectedProjects={selectedProjects} setSelectedProjects={setSelectedProjects} showFilters={showFilters} />,
          },
        ]}
      />

      {open && (
        <Modal
          title={editTaskGroupData ? "Edit Project" : "Create New Project"}
          footer={null}
          open={open}
          onCancel={handleCancel}
          width="min(1100px, 95vw)"
          style={{ top: 24 }}
          bodyStyle={{ paddingTop: 12 }}
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <ProjectForm
              editProjectData={editTaskGroupData}
              handleCancel={handleCancel}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProjectPage;
