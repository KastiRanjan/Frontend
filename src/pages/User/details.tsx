import PageTitle from "@/components/PageTitle";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { List } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";

const UserDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);
    return (
        <>
            <PageTitle title="User Details" />

            <div>
                <Title level={4}>Profile</Title>
                <List
                    dataSource={[
                        {
                            title: "First Name",
                            description: user?.name,
                        },
                        {
                            title: "Phone Number",
                            description: user?.phoneNumber,
                        },
                        {
                            title: "Email",
                            description: user?.email,
                        },

                        {
                            title: "Role",
                            description: user?.role?.name,
                        },
                    ]}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.title}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />

                <Title level={4}>Bank Details</Title>
                <List
                    dataSource={user?.bank_detail?.map((detail: any) => [
                        {
                            title: "Account Number",
                            description: detail.accountNo,
                        },
                        {
                            title: "Account Name",
                            description: detail.accountName,
                        },
                        {
                            title: "Bank Name",
                            description: detail.bankName,
                        },
                        {
                            title: "Bank Branch",
                            description: detail.bankBranch,
                        },
                    ]).flat()}

                    renderItem={(item: any) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.title}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />

                <Title level={4}>Educational Details</Title>
                <List
                    dataSource={user?.education_detail?.map((detail: any) => [
                        {
                            title: "University/College",
                            description: detail.universityCollege,
                        },
                        {
                            title: "Faculty",
                            description: detail.faculty,
                        },
                        {
                            title: "Year of Passing",
                            description: detail.yearOfPassing,
                        },
                        {
                            title: "Place of Issue",
                            description: detail.placeOfIssue,
                        },
                    ]).flat()}
                    renderItem={(item: any) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.title}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </>
    );
};

export default UserDetails;