import PageTitle from "@/components/PageTitle";
import AllWorklogTable from "@/components/Worklog/AllWorklogTable";
import IncomingWorklogTable from "@/components/Worklog/IncomingWorklogTable";
import { Tabs } from "antd";
import { useSession } from "@/context/SessionContext";

const AllWorklogs = () => {
    const { profile } = useSession();
        // Defensive: support both {name, permission} and {permission} role objects
        const userRole = (profile?.role && (profile.role as any).name)
            ? (profile.role as any).name.toLowerCase?.() || ""
            : "";
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
            <Tabs defaultActiveKey="1" items={tabItems} />
        </>
    );
};

export default AllWorklogs;