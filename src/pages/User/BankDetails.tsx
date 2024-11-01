import PageTitle from "@/components/PageTitle";
import BankDetailForm from "@/components/user/BankDetailForm";
import { useNavigate } from "react-router-dom";

const BankDetails = () => {
    const navigate = useNavigate();
    return (
        <>
            <PageTitle title="Bank Details" />
            <BankDetailForm/>
        </>
    );
};
export default BankDetails;
