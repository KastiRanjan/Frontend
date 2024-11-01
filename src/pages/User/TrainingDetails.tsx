import PageTitle from "@/components/PageTitle";
import TrainingDetailForm from "@/components/user/TrainningDetailForm";
import { useNavigate } from "react-router-dom";

const TrainingDetails = () => {
    const navigate = useNavigate();
    return (
        <>
            <PageTitle title="Training Details" />
            <TrainingDetailForm/>
        </>
    );
};
export default TrainingDetails;
