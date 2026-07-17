import AdminWorklogTable from "@/components/Worklog/AdminWorklogTable";
import { Card, Button, Radio } from "antd";
import { useState } from "react";
import WorklogCalendar from "@/components/Worklog/WorklogCalendar";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";

const WorklogAdmin = () => {
  const { profile } = useSession();
  const navigate = useNavigate();
  const profilePermissions = (profile as any)?.role?.permission;
  
  // Check if user has permission to access all worklog page
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  


  const hasAllWorklogPermission = Array.isArray(profilePermissions) && profilePermissions.some(
    (perm: any) => perm.path === '/worklogs/allworklog' && perm.method?.toLowerCase() === 'get'
  );
  
  if (!hasAllWorklogPermission) {
    return (
      <Card>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Permission Denied</h2>
          <p className="mb-4">You don't have permission to access this page.</p>
          <Button type="primary" onClick={() => navigate("/worklogs-all")}>
            Go Back
          </Button>
        </div>
      </Card>
    );
  }
  
  const viewControls = (
    <div className="flex gap-4">
      <Radio.Group 
        value={viewMode} 
        onChange={(e) => setViewMode(e.target.value)}
        optionType="button"
        buttonStyle="solid"
      >
        <Radio.Button value="list">List View</Radio.Button>
        <Radio.Button value="calendar">Calendar View</Radio.Button>
      </Radio.Group>
      <Button type="primary" onClick={() => navigate("/worklogs-all")}>
        Back to My Worklogs
      </Button>
    </div>
  );

  return (
    <div>
      {viewMode === 'calendar' ? (
        <div className="mb-4">
          <div className="flex justify-end mb-4">
            {viewControls}
          </div>
          <WorklogCalendar />
        </div>
      ) : (
        <AdminWorklogTable headerControls={viewControls} />
      )}
    </div>
  );
};

export default WorklogAdmin;