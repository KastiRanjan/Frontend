import AdminWorklogTable from "@/components/Worklog/AdminWorklogTable";
import { Card, Button } from "antd";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";

const WorklogAdmin = () => {
  const { profile } = useSession();
  const navigate = useNavigate();
  
  // Check if user has permission to access all worklog page
  const hasAllWorklogPermission = profile?.role?.permission?.some(
    (perm: any) => perm.path === '/worklogs/allworklog' && perm.method === 'get'
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
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Worklog Management</h1>
        <Button type="primary" onClick={() => navigate("/worklogs-all")}>
          Back to My Worklogs
        </Button>
      </div>
      <AdminWorklogTable />
    </div>
  );
};

export default WorklogAdmin;