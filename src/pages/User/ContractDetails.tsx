import PageTitle from "@/components/PageTitle";
import ContractDetailForm from "@/components/user/ContractDetail";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { useParams } from "react-router-dom";

const ContractDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);
    return (
        <>
            <PageTitle title="Contract Details" />
            {user && <> <ContractDetailForm initialValues={user?.contract_detail} /></>
            }
        </>
    );
};
export default ContractDetails;
