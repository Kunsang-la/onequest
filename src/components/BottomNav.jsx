import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ScrollText, Beer, BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Notice Board', Icon: ScrollText },
    { path: '/search', label: 'Search', Icon: Search },
    { path: '/tavern', label: 'Tavern', Icon: Beer },
    { path: '/journal', label: 'Journal', Icon: BookOpen },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.Icon;
        return (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <Icon size={24} className="nav-icon" />
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="active-glow-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
