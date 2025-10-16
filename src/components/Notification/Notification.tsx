import { useMyNotifications } from "@/hooks/notification/useMyNotifications";
import useNotificationRead from "@/hooks/notification/useNotificationRead";
import { calculateDays } from "@/utils/calculateDays";
import { NotificationType } from "@/types/notification";
import { List, Badge, Tabs, Space, Tag, Card, Divider, Button } from "antd";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { initializeSocket } from "@/service/socket";
import { notification as antdNotification } from "antd";
import { 
    ClockCircleOutlined, 
    NotificationOutlined, 
    CheckCircleOutlined, 
    ProjectOutlined,
    ArrowLeftOutlined,
    AppstoreOutlined 
} from "@ant-design/icons";

// Replace with your actual user ID retrieval logic
const getCurrentUserId = () => localStorage.getItem("userId") || "";

// Icon mapping for notification types
const typeIcons: Record<NotificationType, React.ReactNode> = {
    [NotificationType.WORKLOG]: <ClockCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
    [NotificationType.TASK]: <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
    [NotificationType.NOTICEBOARD]: <NotificationOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
    [NotificationType.PROJECT]: <ProjectOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
    [NotificationType.GENERAL]: <NotificationOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />,
};

// Color mapping for notification types
const typeColors: Record<NotificationType, string> = {
    [NotificationType.WORKLOG]: 'blue',
    [NotificationType.TASK]: 'green',
    [NotificationType.NOTICEBOARD]: 'orange',
    [NotificationType.PROJECT]: 'purple',
    [NotificationType.GENERAL]: 'default',
};

// Background colors for group cards
const typeBgColors: Record<NotificationType, string> = {
    [NotificationType.WORKLOG]: '#e6f7ff',
    [NotificationType.TASK]: '#f6ffed',
    [NotificationType.NOTICEBOARD]: '#fff7e6',
    [NotificationType.PROJECT]: '#f9f0ff',
    [NotificationType.GENERAL]: '#fafafa',
};

// Type labels
const typeLabels: Record<NotificationType, string> = {
    [NotificationType.WORKLOG]: 'Worklog',
    [NotificationType.TASK]: 'Tasks',
    [NotificationType.NOTICEBOARD]: 'Notice Board',
    [NotificationType.PROJECT]: 'Projects',
    [NotificationType.GENERAL]: 'General',
};

const Notification = () => {
    const userId = getCurrentUserId();
    const [selectedType, setSelectedType] = useState<NotificationType | undefined>(undefined);
    const { data: allNotifications, refetch } = useMyNotifications(userId, undefined);
    const { data: filteredNotifications } = useMyNotifications(userId, selectedType);
    const { mutateAsync: updateNotifications } = useNotificationRead();
    const [activeTab, setActiveTab] = useState("unread");

    // Deduplicate notification toasts by notification ID
    const shownToastIds = new Set<string>();
    const queryClient = useQueryClient();
    // Add worklog table refresh logic
    useEffect(() => {
        const sock = initializeSocket();
        if (!sock) return;
        const handleNotification = (data: any) => {
            const toastId = data?.id || data?._id;
            if (toastId && shownToastIds.has(toastId)) return;
            if (toastId) shownToastIds.add(toastId);
            const msg = data?.message?.toLowerCase() || "";
            // Custom toast for todo task events
            if (msg.includes("acknowledged by") && msg.includes("task")) {
                antdNotification.success({
                    message: "Task Acknowledged",
                    description: data?.message,
                    placement: "top",
                });
            } else if (msg.includes("marked as pending by") && msg.includes("task")) {
                antdNotification.warning({
                    message: "Task Set Pending",
                    description: data?.message,
                    placement: "top",
                });
            } else if (msg.includes("completed by") && msg.includes("task")) {
                antdNotification.success({
                    message: "Task Completed",
                    description: data?.message,
                    placement: "top",
                });
            } else if (msg.includes("dropped by") && msg.includes("task")) {
                antdNotification.error({
                    message: "Task Dropped",
                    description: data?.message,
                    placement: "top",
                });
            } else {
                antdNotification.info({
                    message: "New Notification",
                    description: data?.message || "You have a new notification.",
                    placement: "top",
                });
            }
            refetch();
            // If notification is for worklog request, approval, or rejection, trigger worklog table refresh
            if (
                msg.includes("worklog has been requested") ||
                msg.includes("worklog has been approved") ||
                msg.includes("worklog has been rejected")
            ) {
                queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
                queryClient.invalidateQueries({ queryKey: ["worklog-user"] });
                queryClient.invalidateQueries({ queryKey: ["worklog-admin-all"] });
                window.dispatchEvent(new Event("refreshWorklogTable"));
            }
        };
        const handleNotificationRead = () => {
            antdNotification.success({
                message: "Notification Read",
                placement: "top",
            });
            refetch();
        };
        const handleNotificationDeleted = (id: string) => {
            antdNotification.warning({
                message: "Notification Deleted",
                description: `Notification ${id} deleted`,
                placement: "top",
            });
            refetch();
        };
        sock.on("notification", handleNotification);
        sock.on("notification_read", handleNotificationRead);
        sock.on("notification_deleted", handleNotificationDeleted);
        return () => {
            sock.off("notification", handleNotification);
            sock.off("notification_read", handleNotificationRead);
            sock.off("notification_deleted", handleNotificationDeleted);
        };
    }, [refetch]);

    // Use the right data source based on view mode
    const notifications = selectedType ? filteredNotifications : allNotifications;

    // Separate unread and read notifications
    const unread = (notifications || []).filter((n: any) => !n.isRead);
    const read = (notifications || []).filter((n: any) => n.isRead);

    // Group notifications by type and count them
    const getGroupedCounts = (notificationList: any[]) => {
        const counts: Record<NotificationType, number> = {
            [NotificationType.WORKLOG]: 0,
            [NotificationType.TASK]: 0,
            [NotificationType.NOTICEBOARD]: 0,
            [NotificationType.PROJECT]: 0,
            [NotificationType.GENERAL]: 0,
        };
        
        notificationList.forEach((n: any) => {
            const type: NotificationType = n.notification?.type || NotificationType.GENERAL;
            counts[type] = (counts[type] || 0) + 1;
        });
        
        return counts;
    };

    const unreadCounts = getGroupedCounts(unread);
    const readCounts = getGroupedCounts(read);

    // Render grouped view with cards
    const renderGroupedView = (notificationList: any[], counts: Record<NotificationType, number>, showMarkAsRead: boolean) => {
        // If a type is selected, show list view
        if (selectedType) {
            return (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Button 
                            icon={<ArrowLeftOutlined />}
                            onClick={() => setSelectedType(undefined)}
                            type="link"
                            style={{ padding: 0, marginBottom: 8 }}
                        >
                            Back to Groups
                        </Button>
                        <Divider style={{ margin: '8px 0' }} />
                    </div>
                    <List
                        itemLayout="horizontal"
                        dataSource={notificationList}
                        locale={{ emptyText: 'No notifications in this group' }}
                        renderItem={(item: any) => renderNotificationItem(item, showMarkAsRead)}
                    />
                </>
            );
        }

        // Show grouped cards - single column for sidebar
        return (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {Object.entries(counts).map(([type, count]) => {
                    if (count === 0) return null;
                    const notifType = type as NotificationType;
                    return (
                        <Card
                            key={type}
                            hoverable
                            onClick={() => setSelectedType(notifType)}
                            style={{
                                background: typeBgColors[notifType],
                                border: `2px solid`,
                                borderColor: typeColors[notifType],
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                width: '100%',
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '32px', flexShrink: 0 }}>
                                    {typeIcons[notifType]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '14px', 
                                        fontWeight: 600,
                                        color: '#000',
                                        marginBottom: '4px'
                                    }}>
                                        {typeLabels[notifType]}
                                    </div>
                                    <div style={{ 
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: typeColors[notifType]
                                    }}>
                                        {count}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {count === 1 ? 'notification' : 'notifications'}
                                    </div>
                                </div>
                                <div style={{ flexShrink: 0 }}>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </Space>
        );
    };

    // Render notification item with type badge
    const renderNotificationItem = (item: any, showMarkAsRead: boolean = false) => {
        const notifType: NotificationType = item.notification?.type || NotificationType.GENERAL;
        const typeIcon = typeIcons[notifType];
        const typeColor = typeColors[notifType];

        return (
            <List.Item
                onClick={() => {
                    if (item.notification.link) {
                        window.open(item.notification.link, '_self');
                    }
                }}
                style={{ 
                    cursor: item.notification.link ? 'pointer' : 'default',
                    padding: '12px 0'
                }}
            >
                <List.Item.Meta
                    avatar={<div style={{ fontSize: '20px' }}>{typeIcon}</div>}
                    title={
                        <div>
                            <div style={{ marginBottom: '4px' }}>
                                {showMarkAsRead && <Badge dot style={{ marginRight: '4px' }} />}
                                <Tag color={typeColor} style={{ fontSize: '11px', padding: '0 6px', textTransform: 'capitalize' }}>
                                    {typeLabels[notifType]}
                                </Tag>
                            </div>
                            <div style={{ fontSize: '14px', color: '#262626', lineHeight: '1.5' }}>
                                {item.notification.message}
                            </div>
                        </div>
                    }
                    description={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                {calculateDays(item.createdAt)}
                            </span>
                            {showMarkAsRead && (
                                <button
                                    style={{
                                        border: 'none',
                                        background: '#e6f7ff',
                                        color: '#1890ff',
                                        borderRadius: '12px',
                                        padding: '2px 10px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                                        transition: 'background 0.2s',
                                    }}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await updateNotifications({ id: item.id, userId }, {
                                            onSuccess: () => { refetch(); }
                                        });
                                    }}
                                >
                                    ✓ Mark as Read
                                </button>
                            )}
                        </div>
                    }
                />
            </List.Item>
        );
    };

    const items = [
        {
            key: "unread",
            label: (
                <Space>
                    <AppstoreOutlined />
                    <span>Unread ({unread.length})</span>
                </Space>
            ),
            children: (
                <>
                    {!selectedType && unread.length > 0 && (
                        <div style={{ 
                            marginBottom: 12,
                            padding: '8px 12px',
                            background: '#e6f7ff',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#1890ff',
                            textAlign: 'center'
                        }}>
                        </div>
                    )}
                    {unread.length === 0 && !selectedType && (
                        <div style={{ 
                            padding: '32px 16px',
                            textAlign: 'center',
                            color: '#999'
                        }}>
                            🎉 No unread notifications
                        </div>
                    )}
                    {renderGroupedView(unread, unreadCounts, true)}
                </>
            ),
        },
        {
            key: "read",
            label: (
                <Space>
                    <AppstoreOutlined />
                    <span>Past Notifications ({read.length})</span>
                </Space>
            ),
            children: (
                <>
                    {!selectedType && read.length > 0 && (
                        <div style={{ 
                            marginBottom: 12,
                            padding: '8px 12px',
                            background: '#e6f7ff',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#1890ff',
                            textAlign: 'center'
                        }}>
                       </div>
                    )}
                    {read.length === 0 && !selectedType && (
                        <div style={{ 
                            padding: '32px 16px',
                            textAlign: 'center',
                            color: '#999'
                        }}>
                            No past notifications
                        </div>
                    )}
                    {renderGroupedView(read, readCounts, false)}
                </>
            ),
        },
    ];

    return (
        <Tabs
            activeKey={activeTab}
            onChange={(key) => {
                setActiveTab(key);
                setSelectedType(undefined);
            }}
            items={items}
        />
    );
};

export default Notification;