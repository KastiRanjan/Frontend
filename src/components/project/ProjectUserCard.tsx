import { Card, Avatar } from "antd"; // Import Avatar along with Card
import { PlusOutlined } from '@ant-design/icons';
import Meta from "antd/es/card/Meta";
import PropTypes from 'prop-types';

interface ProjectUser {
  id: string;
  avatar?: string;
  name: string;
  email: string;
}

interface UserCardProps {
  user: ProjectUser;
}

interface ProjectUserCardProps {
  data: ProjectUser[];
  onAddMember?: () => void;
}

// Component to render a single user card
const UserCard = ({ user }: UserCardProps) => {
  return (
    <Card
      hoverable
      className="project-user-card"
      cover={
        <div style={{ padding: '16px', background: '#f5f5f5', textAlign: 'center' }}>
          <Avatar
            src={user.avatar} // Will use this if provided
            size={100} // Adjust size as needed
            alt={`${user.name}'s avatar`}
            // If src is null/undefined/invalid, shows default user icon
          />
        </div>
      }
      style={{ width: 240, margin: '16px' }}
    >
      <Meta title={user.name} description={user.email} />
    </Card>
  );
};

// Main component to render all user cards
const ProjectUserCard = ({ data, onAddMember }: ProjectUserCardProps) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {data.map((user: ProjectUser) => (
        <UserCard key={user.id} user={user} />
      ))}
      <Card
        hoverable
        className="project-user-card"
        onClick={onAddMember}
        style={{ width: 240, margin: '16px', cursor: 'pointer' }}
      >
        <div
          style={{
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1677ff'
          }}
        >
          <Avatar
            size={64}
            style={{ backgroundColor: '#e6f4ff', color: '#1677ff', marginBottom: 12 }}
            icon={<PlusOutlined />}
          />
          <div style={{ fontWeight: 600 }}>Add Member</div>
          <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Assign a user to this project</div>
        </div>
      </Card>
    </div>
  );
};

// PropTypes for type checking
UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

ProjectUserCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAddMember: PropTypes.func,
};

// Default props
ProjectUserCard.defaultProps = {
  data: [],
  onAddMember: undefined,
};

export default ProjectUserCard;