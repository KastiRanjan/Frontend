import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faFolder, faUsers, faUserShield, faLock, faTasks, faClock } from '@fortawesome/free-solid-svg-icons';

const Sidebar: React.FC<{ isCollapsed: boolean; toggleCollapse: () => void }> = ({ isCollapsed, toggleCollapse }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [isTaskMenuOpen, setTaskMenuOpen] = useState(false); // State for submenu visibility
  const [submenuHovered, setSubmenuHovered] = useState<string | null>(null); // State for submenu hover

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: faTachometerAlt },
    { path: '/projects', label: 'Projects', icon: faFolder },
    { path: '/users', label: 'Users', icon: faUsers },
    { path: '/roles', label: 'Roles', icon: faUserShield },
    { path: '/permissions', label: 'Permissions', icon: faLock },
    { path: '/tasks', label: 'Tasks', icon: faTasks, hasSubmenu: true }, // Mark Tasks for submenu
    { path: '/worklogs', label: 'Worklogs', icon: faClock },
  ];

  const toggleTaskMenu = () => {
    setTaskMenuOpen(!isTaskMenuOpen);
  };

  return (
    <div style={{ ...styles.sidebar, width: isCollapsed ? '80px' : '250px' }}>
      <button onClick={toggleCollapse} style={styles.toggleButton}>
        {isCollapsed ? '>' : '<'}
      </button>
      <ul style={styles.sidebarList}>
        {menuItems.map((item, index) => (
          <li key={index} style={styles.sidebarItem} onMouseEnter={() => setHovered(item.path)} onMouseLeave={() => setHovered(null)}>
            <Link
              style={{
                ...styles.link,
                backgroundColor: hovered === item.path ? '#575757' : 'transparent',
              }}
              to={item.path}
              onClick={item.hasSubmenu ? toggleTaskMenu : undefined} // Toggle submenu for Tasks
            >
              <FontAwesomeIcon icon={item.icon} style={{ marginRight: isCollapsed ? '0' : '10px' }} />
              {!isCollapsed && item.label}
            </Link>
            {/* Render submenu for Tasks */}
            {item.hasSubmenu && isTaskMenuOpen && !isCollapsed && (
              <ul style={styles.submenu}>
                {['/tasks/TaskTemplate', '/tasks/TaskGroup', '/tasks/TaskAssignment'].map((subItemPath, subIndex) => (
                  <li key={subIndex} style={styles.submenuItem} onMouseEnter={() => setSubmenuHovered(subItemPath)} onMouseLeave={() => setSubmenuHovered(null)}>
                    <Link
                      style={{
                        ...styles.submenuLink,
                        backgroundColor: submenuHovered === subItemPath ? '#575757' : 'transparent',
                      }}
                      to={subItemPath}
                    >
                      {subItemPath.split('/').pop()} {/* Display last part of path as label */}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    height: '100vh',
    backgroundColor: '#EFEFEF',
    padding: '1rem',
    position: 'fixed' as React.CSSProperties['position'],
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    transition: 'width 0.3s',
    zIndex: 1000,
  },
  toggleButton: {
    marginBottom: '1rem',
    cursor: 'pointer',
  },
  sidebarList: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  sidebarItem: {
    margin: '1rem 0',
  },
  link: {
    color: '#123',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s',
  },
  submenu: {
    listStyleType: 'none',
    paddingLeft: '20px', // Indent submenu
    margin: '0',
  },
  submenuItem: {
    margin: '0.5rem 0',
  },
  submenuLink: {
    color: '#123',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    display: 'block',
    transition: 'background-color 0.3s',
  },
};

export default Sidebar;
