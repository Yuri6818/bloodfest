import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-blood-light' : 'text-gray-300';
  };

  return (
    <nav className="bg-dark-darker border-b-2 border-blood fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="text-2xl md:text-3xl font-gothic text-blood-light hover:text-blood transition-colors duration-300"
          >
            BloodFest
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-blood-light focus:outline-none"
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/character" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-lighter hover:text-blood-light transition duration-300 ${isActive('/character')}`}>
                  Character
                </Link>
                <Link to="/combat" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-lighter hover:text-blood-light transition duration-300 ${isActive('/combat')}`}>
                  Combat
                </Link>
                <Link to="/inventory" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-lighter hover:text-blood-light transition duration-300 ${isActive('/inventory')}`}>
                  Inventory
                </Link>
                <Link to="/quests" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-lighter hover:text-blood-light transition duration-300 ${isActive('/quests')}`}>
                  Quests
                </Link>
                <Link to="/market" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-lighter hover:text-blood-light transition duration-300 ${isActive('/market')}`}>
                  Market
                </Link>
                <div className="text-gray-300 px-4 border-l-2 border-blood">
                  Welcome, <span className="text-blood-light">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md bg-blood text-white hover:bg-blood-light transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="px-4 py-2 rounded-md bg-blood text-white hover:bg-blood-light transition duration-300">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-md bg-transparent text-blood-light border border-blood hover:bg-blood bg-opacity-10 transition duration-300">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-dark-darker border-t border-blood py-2">
            {user ? (
              <div className="flex flex-col space-y-1 px-2 py-3">
                <Link 
                  to="/character"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/character')} hover:bg-dark-lighter hover:text-blood-light`}
                  onClick={() => setMenuOpen(false)}
                >
                  Character
                </Link>
                <Link 
                  to="/combat"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/combat')} hover:bg-dark-lighter hover:text-blood-light`}
                  onClick={() => setMenuOpen(false)}
                >
                  Combat
                </Link>
                <Link 
                  to="/inventory"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/inventory')} hover:bg-dark-lighter hover:text-blood-light`}
                  onClick={() => setMenuOpen(false)}
                >
                  Inventory
                </Link>
                <Link 
                  to="/quests"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/quests')} hover:bg-dark-lighter hover:text-blood-light`}
                  onClick={() => setMenuOpen(false)}
                >
                  Quests
                </Link>
                <Link 
                  to="/market"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/market')} hover:bg-dark-lighter hover:text-blood-light`}
                  onClick={() => setMenuOpen(false)}
                >
                  Market
                </Link>
                <div className="px-3 py-2 text-blood-light">
                  Logged in as {user.username}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blood-light hover:bg-dark-lighter"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blood-light bg-blood bg-opacity-20 hover:bg-blood-light hover:bg-opacity-30"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blood-light border border-blood hover:bg-blood hover:bg-opacity-10 mt-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}