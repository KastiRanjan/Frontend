import PersonalDetailForm from "@/components/user/PersonalDetailForm";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { Space } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";

const PersonalDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);

    return (
        <>
            <Space size="large"  className="pb-4">
                <Title level={4}>Personal Details</Title>
            </Space>

            {user && <PersonalDetailForm initialValues={user?.profile} />
            }
        </>
    );
};
export default PersonalDetails;
