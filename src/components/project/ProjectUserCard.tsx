import { Card, Avatar } from "antd"; // Import Avatar along with Card
import Meta from "antd/es/card/Meta";
import PropTypes from 'prop-types';

// Component to render a single user card
const UserCard = ({ user }) => {
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
const ProjectUserCard = ({ data }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {data.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
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
};

// Default props
ProjectUserCard.defaultProps = {
  data: [],
};

export default ProjectUserCard;