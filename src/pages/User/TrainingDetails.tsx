import PageTitle from "@/components/PageTitle";
import TrainingDetailForm from "@/components/user/TrainningDetailForm";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { useParams } from "react-router-dom";

const TrainingDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);
    
    return (
        <>
            <PageTitle title="Training and Other Certification" />
            {user && (
                <>
                    {/* If there are training details, map through them */}
                    {user?.trainning_detail?.length > 0 ? (
                        user.trainning_detail.map((trainning_detail: any) => (
                            <TrainingDetailForm key={trainning_detail.id} initialValues={trainning_detail} />
                        ))
                    ) : (
                        // If no training details exist, show an empty form
                        <TrainingDetailForm initialValues={[]} />
                    )}
                </>
            )}
        </>
    );
};
export default TrainingDetails;
