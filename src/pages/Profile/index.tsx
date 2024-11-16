import { UserMenu } from "@/components/Layout/UserMenu";
import { Card, Col, List, Menu, Row } from "antd";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import PersonalDetails from "../User/PersonalDetails";

const Profile = () => {
    //   const { data: user } = useProfile();
    const { id } = useParams()

    return (
        <Card className="mt-8">
            <Row>
                <Col span={4} className="h-full border-r">
                    <Menu className="h-full">
                        {UserMenu(id)?.map((item) => (
                            <Menu.Item key={item.key}>
                                <Link to={item.key}>{item.label}</Link>
                            </Menu.Item>
                        ))}
                    </Menu>
                </Col>
                <Col span={20} className="px-8"><PersonalDetails /></Col>
            </Row>
        </Card>
    );
};

export default Profile;
