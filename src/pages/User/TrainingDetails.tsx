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
            {user && <>{user?.trainning_detail?.map((trainning_detail: any) => <TrainingDetailForm initialValues={trainning_detail} />)}</>
            }
        </>
    );
};
export default TrainingDetails;
