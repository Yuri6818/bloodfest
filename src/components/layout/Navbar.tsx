import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-dark-darker border-b-2 border-blood/20 fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="text-3xl font-gothic text-blood-light hover:text-blood transition-colors duration-300 animate-pulse-slow"
          >
            BloodFest
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/character" className="nav-link">
                  Character
                </Link>
                <Link to="/combat" className="nav-link">
                  Combat
                </Link>
                <Link to="/inventory" className="nav-link">
                  Inventory
                </Link>
                <Link to="/quests" className="nav-link">
                  Quests
                </Link>
                <div className="text-light-darker px-4 border-l-2 border-blood/20">
                  Welcome, <span className="text-blood-light">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}