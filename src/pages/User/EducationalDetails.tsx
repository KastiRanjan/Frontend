import PageTitle from "@/components/PageTitle";
import EducationDetailForm from "@/components/user/EducationDetailForm";
import { useNavigate } from "react-router-dom";

const EducationalDetails = () => {
    const navigate = useNavigate();
    return (
        <>
            <PageTitle title="Educational Details" />
            <EducationDetailForm/>
        </>
    );
};
export default EducationalDetails;
