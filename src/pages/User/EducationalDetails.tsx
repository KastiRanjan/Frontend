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
            {user && (
                <>
                    {/* If there are education details, map through them */}
                    {user?.education_detail?.length > 0 ? (
                        user.education_detail.map((education: any) => (
                            <EducationDetailForm key={education.id} initialValues={education} />
                        ))
                    ) : (
                        // If no education details exist, show an empty form
                        <EducationDetailForm initialValues={[]} />
                    )}
                </>
            )}
        </>
    );
};
export default EducationalDetails;
