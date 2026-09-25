import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Skull, Disc } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  return (
    <nav className="main-navbar">
      <div className="navbar-brand">
        <span className="blinking-title">CONTENT VÔ HẠN CÙNG IDV</span>
      </div>

      <div className="navbar-menu">
        <NavLink
          to="/survivor"
          className={({ isActive }) => `nav-item survivor-nav ${isActive ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>SURVIVOR MODE</span>
        </NavLink>

        <NavLink
          to="/hunter"
          className={({ isActive }) => `nav-item hunter-nav ${isActive ? 'active' : ''}`}
        >
          <Skull size={20} />
          <span>HUNTER MODE</span>
        </NavLink>

        <NavLink
          to="/wheel"
          className={({ isActive }) => `nav-item wheel-nav ${isActive ? 'active' : ''}`}
        >
          <Disc size={20} />
          <span>VÒNG QUAY CUSTOM</span>
        </NavLink>
      </div>
    </nav>
  );
};
