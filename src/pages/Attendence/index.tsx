import AttendenceTable from "@/components/Attendence/AttendenceTable";
import PageTitle from "@/components/PageTitle";
import { useSession } from "@/context/SessionContext";
import { useUser } from "@/hooks/user/useUser";
import "./Attendence.css";
import { 
    Card, 
    Select, 
    Space, 
    Typography, 
    Badge,
    Button,
    Alert
} from "antd";
import { 
    ClockCircleOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Option } = Select;
const { Title } = Typography;

const Attendence = () => {
    const { profile } = useSession();
    const [personalViewUserId, setPersonalViewUserId] = useState<string>(""); // For the personal section
    
    // Fetch users for the dropdown (only if super user)
    const { data: usersData } = useUser({
        status: "active",
        limit: 100,
        page: 1,
        keywords: ""
    });

    // Get permissions and role info
    const permissions = profile?.role?.permission || [];
    const roleName = (profile?.role as any)?.name || '';
    
    // For now, let's use role name as primary check since user is "superuser"
    const isRoleSuperUser = roleName === 'superuser' || 
                           roleName === 'admin' || 
                           roleName?.toLowerCase().includes('admin') ||
                           roleName?.toLowerCase().includes('super');
    
    // Try to extract permission names from objects
    const permStrings = permissions.map((p: any) => {
        if (typeof p === 'string') return p;
        // Try different possible property names
        return p?.name || p?.permission || p?.description || p?.resource || '';
    });
    
    const hasAttendancePermissions = permStrings.some((permString: string) => 
        permString === 'View All Users Attendance' ||
        permString === 'View Today All Users Attendance' ||
        (permString && permString.toLowerCase && permString.toLowerCase().includes('attendance') && permString.toLowerCase().includes('all'))
    );
    
    const isSuperUser = isRoleSuperUser || hasAttendancePermissions;

    // Security check: Reset personalViewUserId if user is not a superuser
    useEffect(() => {
        if (!isSuperUser && personalViewUserId) {
            setPersonalViewUserId("");
        }
    }, [isSuperUser, personalViewUserId]);

    const handleClearPersonalSelection = () => {
        setPersonalViewUserId("");
    };

    // Get the selected user name for display
    const getSelectedUserName = (userId: string) => {
        if (!userId) return null;
        if (userId === "all-today") return "All Users Today";
        const user = usersData?.results?.find((u: any) => u.id === userId);
        return user ? user.name : "Unknown User";
    };

    return (
        <>
            <PageTitle 
                title="Attendance Management" 
                description={isSuperUser ? "Manage attendance for all users" : "View and manage your attendance"} 
            />
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Personal Attendance Section - Always Visible */}
                <Card 
                    title={
                        <Space>
                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                            <Title level={4} style={{ margin: 0 }}>
                                {personalViewUserId ? `${getSelectedUserName(personalViewUserId)}'s Attendance` : "My Attendance"}
                            </Title>
                        </Space>
                    }
                    extra={
                        <Space>
                            {/* Only show dropdown for superusers/admins */}
                            {isSuperUser && (
                                <Select
                                    placeholder="Switch user view"
                                    style={{ width: 250 }}
                                    value={personalViewUserId}
                                    onChange={setPersonalViewUserId}
                                    allowClear
                                    size="small"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)
                                            ?.toLowerCase()
                                            ?.includes(input.toLowerCase())
                                    }
                                >
                                    {/* Special option for all users today */}
                                    <Option key="all-today" value="all-today">
                                        📅 All Users Today
                                    </Option>
                                    <Option key="divider" disabled style={{ borderBottom: '1px solid #d9d9d9' }}>
                                        ──── Individual Users ────
                                    </Option>
                                    {usersData?.results?.map((user: any) => (
                                        <Option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </Option>
                                    ))}
                                </Select>
                            )}
                            {isSuperUser && (
                                <Badge 
                                    count="Super User" 
                                    style={{ backgroundColor: '#f50' }} 
                                />
                            )}
                            <Badge 
                                count={personalViewUserId ? "Viewing Other" : "Personal"} 
                                style={{ backgroundColor: personalViewUserId ? '#fa8c16' : '#52c41a' }} 
                            />
                        </Space>
                    }
                >
                    {personalViewUserId === "all-today" && isSuperUser ? (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Alert
                                message="Viewing today's attendance for all users"
                                type="info"
                                showIcon
                                action={
                                    <Button size="small" type="link" onClick={handleClearPersonalSelection}>
                                        Back to My Attendance
                                    </Button>
                                }
                                style={{ marginBottom: 16 }}
                            />
                            <AttendenceTable viewType="today-all" />
                        </Space>
                    ) : isSuperUser && personalViewUserId ? (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Alert
                                message={`Viewing attendance for: ${getSelectedUserName(personalViewUserId)}`}
                                type="info"
                                showIcon
                                action={
                                    <Button size="small" type="link" onClick={handleClearPersonalSelection}>
                                        Back to My Attendance
                                    </Button>
                                }
                                style={{ marginBottom: 16 }}
                            />
                            <AttendenceTable viewType="by-user" selectedUserId={personalViewUserId} />
                        </Space>
                    ) : (
                        <AttendenceTable viewType="my" />
                    )}
                </Card>
            </Space>
        </>
    );
};

export default Attendence;