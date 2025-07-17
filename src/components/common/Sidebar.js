import React, { useState } from 'react';

const Sidebar = ({ menuItems, activeItem, onItemClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          onClick={toggleSidebar}
          className="sidebar-toggle"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '→' : '←'}
        </button>
        {!isCollapsed && (
          <h3 className="sidebar-title">Dashboard</h3>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              <button
                onClick={() => onItemClick(item.id)}
                className={`sidebar-menu-link ${activeItem === item.id ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="sidebar-menu-icon">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="sidebar-menu-label">
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;