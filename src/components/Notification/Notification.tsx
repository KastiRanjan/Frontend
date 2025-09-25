import { useMyNotifications } from "@/hooks/notification/useMyNotifications";
import useNotificationRead from "@/hooks/notification/useNotificationRead";
import { calculateDays } from "@/utils/calculateDays";
import { List, Badge, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { initializeSocket } from "@/service/socket";
import { notification as antdNotification } from "antd";

// Replace with your actual user ID retrieval logic
const getCurrentUserId = () => localStorage.getItem("userId") || "";

const Notification = () => {
    const userId = getCurrentUserId();
    const { data: notifications, refetch } = useMyNotifications(userId);
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
        const handleNotificationRead = (data: any) => {
            antdNotification.success({
                message: "Notification Read",
                description: data?.message || "Notification marked as read.",
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

    // Separate unread and read notifications
    const unread = (notifications || []).filter((n: any) => !n.isRead);
    const read = (notifications || []).filter((n: any) => n.isRead);

    const items = [
        {
            key: "unread",
            label: "Unread Notifications",
            children: (
                <List
                    itemLayout="horizontal"
                    dataSource={unread}
                    renderItem={(item: any) => (
                        <List.Item
                            actions={[ 
                                <button
                                    key="mark-read"
                                    style={{
                                        border: 'none',
                                        background: '#e6f7ff',
                                        color: '#1890ff',
                                        borderRadius: '12px',
                                        padding: '2px 10px',
                                        fontSize: '12px',
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
                            ]}
                            onClick={() => {
                                if (item.notification.link) {
                                    window.open(item.notification.link, '_self');
                                }
                            }}
                        >
                            <List.Item.Meta
                                title={<Badge dot>{item.notification.message}</Badge>}
                                description={<div>{calculateDays(item.createdAt)} <br /></div>}
                            />
                        </List.Item>
                    )}
                />
            ),
        },
        {
            key: "read",
            label: "Past Notifications",
            children: (
                <List
                    itemLayout="horizontal"
                    dataSource={read}
                    renderItem={(item: any) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.notification.message}
                                description={<div>{calculateDays(item.createdAt)} <br /></div>}
                            />
                        </List.Item>
                    )}
                />
            ),
        },
    ];

    return (
        <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
        />
    );
};

export default Notification;