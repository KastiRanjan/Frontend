import PageTitle from "@/components/PageTitle";
import PersonalDetailForm from "@/components/user/PersonalDetailForm";
import { useNavigate } from "react-router-dom";

const PersonalDetails = () => {
    const navigate = useNavigate();
    return (
        <>
            <PageTitle title="Personal Details" />
            <PersonalDetailForm/>
        </>
    );
};
export default PersonalDetails;
