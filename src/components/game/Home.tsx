import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useCharacter } from '@hooks/useCharacter';
import LoadingSpinner from '@components/layout/LoadingSpinner';
import { useEffect, useState } from 'react';

const Home = () => {
  const { user } = useAuth();
  const { character, loading, error } = useCharacter();
  const [bloodDrip, setBloodDrip] = useState(false);

  // Animation effect for blood drip
  useEffect(() => {
    const timer = setTimeout(() => {
      setBloodDrip(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-red-900/50 border-2 border-red-700 p-8 rounded-lg max-w-md w-full shadow-lg">
          <p className="text-2xl text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 relative">
        {/* Blood drips */}
        <div className={`absolute top-0 left-1/4 w-0.5 bg-gradient-to-b from-red-900 to-red-600 transition-all duration-[1500ms] ease-in-out ${bloodDrip ? 'h-32' : 'h-0'}`} style={{ transitionDelay: '300ms' }}></div>
        <div className={`absolute top-0 right-1/3 w-0.5 bg-gradient-to-b from-red-900 to-red-600 transition-all duration-[2000ms] ease-in-out ${bloodDrip ? 'h-48' : 'h-0'}`} style={{ transitionDelay: '1200ms' }}></div>
        
        <div className="w-full max-w-4xl bg-black bg-opacity-80 border-2 border-red-900 p-6 md:p-8 rounded-lg shadow-2xl relative overflow-hidden">
          {/* Gothic ornamental corner decorations */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-red-700"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-red-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-red-700"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-red-700"></div>
          
          <h1 className="text-4xl md:text-6xl font-gothic text-red-500 text-center mb-6 md:mb-8 drop-shadow-lg">
            Welcome to <span className="relative">
              Bloodfest
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-red-600"></span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 text-center mb-8 md:mb-12">
            Begin your dark journey, <span className="text-red-400 font-semibold">{user?.username}</span>!
          </p>
          
          <div className="flex justify-center">
            <Link 
              to="/create-character" 
              className="group relative bg-red-900 hover:bg-red-800 text-white text-lg md:text-xl font-semibold px-8 md:px-10 py-3 md:py-4 rounded-lg transition-all duration-500 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">Create Your Character</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </Link>
          </div>
          
          <div className="mt-16 text-center text-gray-500 italic">
            "In the realm of shadows, power flows with blood..."
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6 md:gap-8 relative">
      {/* Ambient blood particles */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
        <div className="absolute top-3/4 left-1/2 w-1 h-1 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Header Section */}
      <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 md:p-8 rounded-lg shadow-xl relative overflow-hidden">
        {/* Gothic ornament */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
        
        <h1 className="text-3xl md:text-5xl font-gothic text-red-500 text-center mb-4 drop-shadow-lg">
          Welcome Back to Bloodfest
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 text-center">
          Greetings, <span className="text-red-400 font-semibold relative">
            {character.name}
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-600"></span>
          </span>!
        </p>
      </div>

      {/* Character and Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Stats Card */}
        <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg h-full shadow-xl relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-900 bg-opacity-10 rounded-bl-3xl"></div>
          
          <h2 className="text-2xl font-gothic text-red-500 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Character Stats
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-red-900 border-opacity-30 pb-2 group hover:border-red-600 hover:border-opacity-50 transition-colors duration-300">
              <span className="text-gray-300 group-hover:text-gray-200 transition-colors">Level</span>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-900 opacity-70 mr-2"></div>
                <span className="text-red-400 text-xl font-semibold group-hover:text-red-300 transition-colors">{character.level}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-red-900 border-opacity-30 pb-2 group hover:border-red-600 hover:border-opacity-50 transition-colors duration-300">
              <span className="text-gray-300 group-hover:text-gray-200 transition-colors">Health</span>
              <div className="flex flex-col items-end">
                <span className="text-red-400 text-xl font-semibold group-hover:text-red-300 transition-colors">
                  {character.health.current}/{character.health.max}
                </span>
                <div className="w-32 bg-red-900 bg-opacity-20 h-1.5 mt-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full" 
                    style={{ width: `${(character.health.current / character.health.max) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-red-900 border-opacity-30 pb-2 group hover:border-red-600 hover:border-opacity-50 transition-colors duration-300">
              <span className="text-gray-300 group-hover:text-gray-200 transition-colors">Energy</span>
              <div className="flex flex-col items-end">
                <span className="text-red-400 text-xl font-semibold group-hover:text-red-300 transition-colors">
                  {character.mana?.current || 0}/{character.mana?.max || 0}
                </span>
                <div className="w-32 bg-red-900 bg-opacity-20 h-1.5 mt-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-900 to-yellow-600 h-full rounded-full" 
                    style={{ width: `${character.mana ? (character.mana.current / character.mana.max) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg h-full shadow-xl relative">
          <div className="absolute top-0 left-0 w-20 h-20 bg-red-900 bg-opacity-10 rounded-br-3xl"></div>
          
          <h2 className="text-2xl font-gothic text-red-500 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Quick Actions
          </h2>
          
          <div className="space-y-4">
            <Link 
              to="/combat" 
              className="group block bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Enter Combat
              </span>
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Link>
            
            <Link 
              to="/inventory" 
              className="group block bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
                View Inventory
              </span>
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Link>
            
            <Link 
              to="/quests" 
              className="group block bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                View Quests
              </span>
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Link>
            
            <Link 
              to="/market" 
              className="group block bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Visit Market
              </span>
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      {character.level < 5 && (
        <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg shadow-xl relative">
          <div className="absolute right-4 top-4 flex items-center text-xs text-red-400 opacity-70">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>New player guide</span>
          </div>
          
          <h2 className="text-2xl font-gothic text-red-500 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Getting Started
          </h2>
          
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-900 bg-opacity-20 flex items-center justify-center mr-3">
                <span className="text-red-500 group-hover:text-red-400">01</span>
              </div>
              <div>
                <h3 className="text-red-300 group-hover:text-red-200 text-lg mb-1">Combat Training</h3>
                <p className="text-gray-400 group-hover:text-gray-300">Engage in combat to gain experience and level up your character</p>
              </div>
            </li>
            
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-900 bg-opacity-20 flex items-center justify-center mr-3">
                <span className="text-red-500 group-hover:text-red-400">02</span>
              </div>
              <div>
                <h3 className="text-red-300 group-hover:text-red-200 text-lg mb-1">Equipment Mastery</h3>
                <p className="text-gray-400 group-hover:text-gray-300">Check your inventory for useful items and equip the best gear</p>
              </div>
            </li>
            
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-900 bg-opacity-20 flex items-center justify-center mr-3">
                <span className="text-red-500 group-hover:text-red-400">03</span>
              </div>
              <div>
                <h3 className="text-red-300 group-hover:text-red-200 text-lg mb-1">Dark Quests</h3>
                <p className="text-gray-400 group-hover:text-gray-300">Complete quests to earn rewards and uncover the dark secrets of Bloodfest</p>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;