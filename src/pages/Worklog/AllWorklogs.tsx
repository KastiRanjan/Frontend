import PageTitle from "@/components/PageTitle";
import AllWorklogTable from "@/components/Worklog/AllWorklogTable";
import IncomingWorklogTable from "@/components/Worklog/IncomingWorklogTable";
import { Tabs, Button } from "antd";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";

const AllWorklogs = () => {
    const { profile } = useSession();
    const navigate = useNavigate();
    
    // Defensive: support both {name, permission} and {permission} role objects
    const userRole = (profile?.role && (profile.role as any).name)
        ? (profile.role as any).name.toLowerCase?.() || ""
        : "";
    
    // Check if user has permission to access all worklog page
    const hasAllWorklogPermission = profile?.role?.permission?.some(
        (perm: any) => perm.path === '/worklogs/allworklog' && perm.method === 'get'
    );
    
    const tabItems = [
        {
            label: `Requested`,
            key: "1",
            children: <AllWorklogTable status="requested" />,
        },
        {
            label: `Approved`,
            key: "2",
            children: <AllWorklogTable status="approved" />,
        },
        {
            label: `Rejected`,
            key: "3",
            children: <AllWorklogTable status="rejected" />,
        },
    ];
    
    if (userRole !== "auditjunior") {
        tabItems.push(
            {
                label: `Incoming Requests`,
                key: "4",
                children: <IncomingWorklogTable status="requested" />,
            },
            {
                label: `Incoming Approved`,
                key: "5",
                children: <IncomingWorklogTable status="approved" />,
            },
            {
                label: `Incoming Rejected`,
                key: "6",
                children: <IncomingWorklogTable status="rejected" />,
            }
        );
    }
    
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Worklogs</h1>
                {hasAllWorklogPermission && (
                    <Button 
                        type="primary" 
                        onClick={() => navigate("/worklog/allworklog")}
                    >
                        View All Worklogs
                    </Button>
                )}
            </div>
            <Tabs defaultActiveKey="1" items={tabItems} />
        </>
    );
};

export default AllWorklogs;