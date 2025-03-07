import { UserMenu } from "@/components/Layout/UserMenu";
import { Card, Col, Menu, Row } from "antd";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

interface ProfileProps {
    component: React.ComponentType; // This will accept a React component as a prop
}

const Profile: React.FC<ProfileProps> = ({ component: Component }) => {
    const { id } = useParams();

    return (
        <Card>
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
                <Col span={20} className="px-8">
                    {/* Render the passed component here */}
                    <Component />
                </Col>
            </Row>
        </Card>
    );
};

export default Profile;
