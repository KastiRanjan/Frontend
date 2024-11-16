import { useMyNotifications } from "@/hooks/notification/useMyNotifications";
import useNotificationRead from "@/hooks/notification/useNotificationRead";
import { calculateDays } from "@/utils/calculateDays";
import { List } from "antd";


const Notification = () => {
    const { data: notifications } = useMyNotifications();

    const { mutateAsync: updateNotifications } = useNotificationRead();

    return <List
        itemLayout="horizontal"
        dataSource={notifications || []}
        renderItem={(item: any) => (
            <List.Item onClick={() => { updateNotifications({ id: item.id, }, { onSuccess: () => { window.open(item.link, '_self') } }) }}>
                <List.Item.Meta
                    title={item.message}
                    description={<div>
                        {calculateDays(item.createdAt)} <br />
                    </div>}
                />
            </List.Item>
        )}
    />
};

export default Notification;