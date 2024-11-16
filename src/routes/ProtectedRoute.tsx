import { useSession } from "@/context/SessionContext";
import { Spin } from "antd";

const ProtectedRoute = ({ component, method, resource }: any) => {

    const { permissions, isProfilePending } = useSession()

    // Check if the user has the required permission
    const hasPermission = permissions.some((permission: any) => {
        if (permission.method === method && permission.resource === resource) {
            return true;
        }
        return false;
    })
    if (isProfilePending) {
        return <div className="flex justify-center py-24"><Spin size="large" /></div> 
    }

    return <>{hasPermission ? component : <>forbidden</>}</>

};

export default ProtectedRoute;
