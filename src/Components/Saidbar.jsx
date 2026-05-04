// Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiSearch, FiShoppingBag, FiUser, FiCalendar, FiMessageSquare,
} from 'react-icons/fi';

const menuItems = [
  { name: 'Home',     icon: FiHome,          path: '/' },
  { name: 'Browse',   icon: FiSearch,        path: '/browse' },
  { name: 'Orders',   icon: FiShoppingBag,   path: '/orders' },
  { name: 'Profil',  icon: FiUser,          path: '/profil' },
  { name: 'Calendar', icon: FiCalendar,      path: '/calendar' },
  { name: 'Chat',     icon: FiMessageSquare, path: '/xchat' },
];

const Sidebar = () => {
  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="w-[260px] bg-white h-screen sticky top-0 hidden md:flex flex-col border-r border-gray-100 shadow-sm"
    >
      
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-[27px] font-bold tracking-[-0.5px]" style={{ color: '#E05A1F' }}>
          FreshDash
        </h1>
        <p className="text-sm text-gray-400 mt-1">Effortless Vitality</p>
      </div>

      
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3.5 px-6 py-[13px] text-[15.5px] font-medium 
               rounded-2xl mx-2 transition-all duration-200 relative overflow-hidden ` +
              (isActive
                ? 'bg-[#FFF4EB] text-[#E05A1F]'
                : 'text-gray-600 hover:bg-gray-50')
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  strokeWidth={2.25} 
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#E05A1F]' : 'text-gray-500 group-hover:text-gray-700'}`} 
                />
                <span>{item.name}</span>

                {/* Active vertical accent bar */}
                {isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[4px] h-7 bg-[#E05A1F] rounded-l-xl" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Order Now Button */}
      <div className="px-6 pb-8 mt-auto">
        <button
          className="w-full py-[14px] rounded-2xl text-white font-semibold text-[15px] 
                     transition-all duration-200 hover:brightness-105 active:scale-[0.97]"
          style={{ backgroundColor: '#E05A1F' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#C44A1A')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#E05A1F')}
        >
          Order Now
        </button>
      </div>
    </div>
  );
};

export default Sidebar;