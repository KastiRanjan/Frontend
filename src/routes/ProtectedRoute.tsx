import { useSession } from "@/context/SessionContext";

const ProtectedRoute = ({ component, method, resource }: any) => {

    const { permissions } = useSession()

    // Check if the user has the required permission
    const hasPermission = permissions.some((permission: any) => {
        if (permission.method === method && permission.resource === resource) {
            return true;
        }
        return false;
    })

    return <>{hasPermission ? component : <>forbidden</>}</>

};

export default ProtectedRoute;
