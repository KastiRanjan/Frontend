import PageTitle from "@/components/PageTitle";
import ContractDetailForm from "@/components/user/ContractDetailForm";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { useParams } from "react-router-dom";

const ContractDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);
    
    const contractData = user?.contract_detail?.[0] || null;
    
    return (
        <>
            <PageTitle title="Contract Details" />
            <ContractDetailForm initialValues={contractData} />
        </>
    );
};
export default ContractDetails;
