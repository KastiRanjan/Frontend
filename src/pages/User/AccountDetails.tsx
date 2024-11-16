import PageTitle from "@/components/PageTitle";
import UserForm from "@/components/user/UserForm";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { useParams } from "react-router-dom";

const AccountDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);

    const refinedUser = {
        ...user,
        role:{label:user?.role.name, value:user?.role.id}
    }
    return (
        <>
            <PageTitle title="Account Details" />
            {user && <UserForm initialValues={refinedUser} />}
        </>
    );
};
export default AccountDetails;
