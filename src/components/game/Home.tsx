import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useCharacter } from '@hooks/useCharacter';
import LoadingSpinner from '@components/layout/LoadingSpinner';

const Home = () => {
  const { user } = useAuth();
  const { character, loading, error } = useCharacter();

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="text-blood text-center">
        {error}
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-gothic text-blood-light mb-6">Welcome to Bloodfest</h1>
        <p className="text-xl mb-8">Begin your dark journey, {user?.username}!</p>
        <Link 
          to="/create-character" 
          className="btn btn-primary text-xl"
        >
          Create Your Character
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-gothic text-blood-light mb-6">Welcome Back to Bloodfest</h1>
      <p className="text-xl mb-8">Greetings, {character.name}!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-dark-darker p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-gothic text-blood-light mb-4">Character Stats</h2>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="text-blood-light">{character.level}</span>
            </div>
            <div className="flex justify-between">
              <span>Health:</span>
              <span className="text-blood-light">{character.health}/{character.maxHealth}</span>
            </div>
            <div className="flex justify-between">
              <span>Energy:</span>
              <span className="text-blood-light">{character.energy}/{character.maxEnergy}</span>
            </div>
            <div className="border-t border-blood/20 my-3"></div>
            {Object.entries(character.stats).map(([stat, value]) => (
              <div key={stat} className="flex justify-between">
                <span className="capitalize">{stat}:</span>
                <span className="text-blood-light">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-darker p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-gothic text-blood-light mb-4">Quick Actions</h2>
          <div className="grid gap-4">
            <Link 
              to="/combat" 
              className="btn btn-primary"
            >
              Enter Combat
            </Link>
            <Link 
              to="/inventory" 
              className="btn btn-outline"
            >
              View Inventory
            </Link>
            <Link 
              to="/quests" 
              className="btn btn-outline"
            >
              View Quests
            </Link>
          </div>
        </div>

        {character.level < 5 && (
          <div className="md:col-span-2 bg-dark-darker p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-gothic text-blood-light mb-4">Getting Started</h2>
            <div className="text-left space-y-2">
              <p>🗡️ Begin your journey by engaging in combat to gain experience</p>
              <p>📦 Check your inventory for useful items</p>
              <p>📜 Accept quests to earn rewards and uncover the story</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;