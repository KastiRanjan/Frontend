import PageTitle from "@/components/PageTitle";
import BankDetailForm from "@/components/user/BankDetailForm";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { useParams } from "react-router-dom";

const BankDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);
    return (
        <>
            <PageTitle title="Bank Details" />
            {user && <> <BankDetailForm initialValues={user?.bank_detail} /></>
            }
        </>
    );
};
export default BankDetails;
