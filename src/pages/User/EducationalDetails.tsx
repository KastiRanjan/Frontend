import PageTitle from "@/components/PageTitle";
import EducationDetailForm from "@/components/user/EducationDetailForm";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { useParams } from "react-router-dom";

const EducationalDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);
    return (
        <>
            <PageTitle title="Educational Details" />
            {user &&
                <>{user?.education_detail?.map((education: any) => <EducationDetailForm initialValues={education} />)}</>
            }
        </>
    );
};
export default EducationalDetails;
