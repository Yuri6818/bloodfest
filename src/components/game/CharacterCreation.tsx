import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { useCharacter, CharacterClass } from '@contexts/CharacterContext';

// Appearance options
const hairStyles = ['Short', 'Medium', 'Long', 'Braided', 'Shaved', 'Mohawk', 'Ponytail', 'Bald'];
const hairColors = ['Black', 'Brown', 'Blonde', 'Red', 'White', 'Silver', 'Blue', 'Purple', 'Green'];
const skinTones = ['Pale', 'Fair', 'Medium', 'Olive', 'Tan', 'Dark', 'Ebony', 'Ashen', 'Bluish'];
const facialFeatures = ['Sharp', 'Soft', 'Angular', 'Round', 'Square', 'Heart-shaped', 'Gaunt', 'Aristocratic'];
const markings = ['None', 'Scar', 'Tattoo', 'Birthmark', 'Ritual Markings', 'Runes', 'Brand', 'Stitches'];

const CharacterCreation = () => {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [characterData, setCharacterData] = useState({
    name: '',
    characterClass: '',
    appearance: {
      hairStyle: '',
      hairColor: '',
      facialFeatures: '',
      skinTone: '',
      markings: '',
    },
    background: ''
  });

  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { 
    classes, 
    isLoading, 
    error, 
    fetchClasses, 
    createCharacter, 
    clearError,
    useMockData,
    setUseMockData
  } = useCharacter();
  const navigate = useNavigate();

  // Fetch character classes on mount if needed
  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCharacterData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setCharacterData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleClassSelection = (classId: string) => {
    setSelectedClass(classId);
    setCharacterData(prev => ({
      ...prev,
      characterClass: classId
    }));
  };
  
  const nextStep = () => {
    // Validate current step
    if (step === 1 && !selectedClass) {
      // Set local error instead of using context error to avoid disruption
      addNotification('error', 'Please select a character class');
      return;
    }
    
    if (step === 2 && !characterData.name) {
      addNotification('error', 'Please enter a character name');
      return;
    }
    
    clearError();
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    clearError();
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Final validation
    if (!characterData.name || !characterData.characterClass) {
      addNotification('error', 'Character name and class are required');
      return;
    }
    
    try {
      await createCharacter(characterData);
      addNotification('success', 'Character created successfully!');
      navigate('/');
    } catch (err: any) {
      // Error is handled by the context
      console.error('Character creation failed');
      addNotification('error', 'Failed to create character');
    }
  };

  const toggleMockData = () => {
    setUseMockData(!useMockData);
    // Fetch classes with the new mode
    fetchClasses();
  };
  
  // Render selected class details
  const renderClassDetails = () => {
    if (!selectedClass) return null;
    
    const classData = classes.find(c => c.id === selectedClass);
    if (!classData) return null;
    
    return (
      <div className="mt-4 bg-dark-lighter/70 p-4 border border-blood/30">
        <h3 className="text-xl font-gothic text-blood-light mb-2">{classData.name}</h3>
        <p className="mb-3 text-light-darker">{classData.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-md font-gothic text-bone-light mb-1">Base Stats</h4>
            <ul className="list-none space-y-1">
              <li><span className="text-bone">Health:</span> {classData.baseStats.health}</li>
              <li><span className="text-bone">Strength:</span> {classData.baseStats.strength}</li>
              <li><span className="text-bone">Dexterity:</span> {classData.baseStats.dexterity}</li>
              <li><span className="text-bone">Intelligence:</span> {classData.baseStats.intelligence}</li>
              <li><span className="text-bone">Willpower:</span> {classData.baseStats.willpower}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-gothic text-bone-light mb-1">
              Special Resource: {classData.specialResource.name}
            </h4>
            <p className="text-sm text-light-darker">{classData.specialResource.description}</p>
            
            <h4 className="text-md font-gothic text-bone-light mt-3 mb-1">Starting Abilities</h4>
            <ul className="list-disc list-inside">
              {classData.startingAbilities.map((ability, index) => (
                <li key={index} className="text-light-darker">{ability}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  // Render step content
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gothic text-blood-light">Choose Your Dark Path</h2>
            <p className="text-light-darker">Select the supernatural class that will define your journey through the shadows.</p>
            
            {error && (
              <div className="bg-blood/20 border border-blood text-blood-light p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="useMockData"
                checked={useMockData}
                onChange={toggleMockData}
                className="mr-2"
              />
              <label htmlFor="useMockData" className="text-light-darker">
                {useMockData 
                  ? "Using mock character data (backend unavailable)" 
                  : "Try to use real backend data (may fail)"}
              </label>
            </div>
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-t-blood border-r-blood/30 border-b-blood/10 border-l-blood/60 rounded-full animate-spin mx-auto"></div>
                <p className="mt-3 text-light-darker">Loading classes...</p>
              </div>
            ) : classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map(characterClass => (
                  <div 
                    key={characterClass.id}
                    className={`cursor-pointer card transition-transform duration-300 hover:scale-102 ${selectedClass === characterClass.id ? 'border-blood-light bg-dark-lighter' : 'border-blood/50'}`}
                    onClick={() => handleClassSelection(characterClass.id)}
                  >
                    <h3 className="text-xl font-gothic text-blood-light mb-1">{characterClass.name}</h3>
                    <p className="text-sm text-light-darker">{characterClass.description.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-blood-light">No character classes available.</p>
                <button 
                  onClick={() => {
                    setUseMockData(true);
                    fetchClasses();
                  }}
                  className="mt-4 px-4 py-2 bg-blood text-dark rounded hover:bg-blood-light"
                >
                  Load Mock Data
                </button>
              </div>
            )}
            
            {renderClassDetails()}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gothic text-blood-light">Name Your Character</h2>
            <p className="text-light-darker">What name will strike fear into the hearts of your enemies?</p>
            
            <div className="my-4">
              <label htmlFor="name" className="block text-light font-gothic mb-1">Character Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={characterData.name}
                onChange={handleChange}
                className="w-full bg-dark-lighter border border-blood/50 rounded-none p-2 text-light focus:border-blood"
                placeholder="Enter name..."
                required
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gothic text-blood-light">Shape Your Appearance</h2>
            <p className="text-light-darker">Craft the physical form that will carry your dark legacy.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="appearance.hairStyle" className="block text-light font-gothic mb-1">Hair Style</label>
                <select
                  id="appearance.hairStyle"
                  name="appearance.hairStyle"
                  value={characterData.appearance.hairStyle}
                  onChange={handleChange}
                  className="w-full bg-dark-lighter border border-blood/50 rounded-none p-2 text-light focus:border-blood"
                >
                  <option value="">Select...</option>
                  {hairStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="appearance.hairColor" className="block text-light font-gothic mb-1">Hair Color</label>
                <select
                  id="appearance.hairColor"
                  name="appearance.hairColor"
                  value={characterData.appearance.hairColor}
                  onChange={handleChange}
                  className="w-full bg-dark-lighter border border-blood/50 rounded-none p-2 text-light focus:border-blood"
                >
                  <option value="">Select...</option>
                  {hairColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="appearance.skinTone" className="block text-light font-gothic mb-1">Skin Tone</label>
                <select
                  id="appearance.skinTone"
                  name="appearance.skinTone"
                  value={characterData.appearance.skinTone}
                  onChange={handleChange}
                  className="w-full bg-dark-lighter border border-blood/50 rounded-none p-2 text-light focus:border-blood"
                >
                  <option value="">Select...</option>
                  {skinTones.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="appearance.facialFeatures" className="block text-light font-gothic mb-1">Facial Features</label>
                <select
                  id="appearance.facialFeatures"
                  name="appearance.facialFeatures"
                  value={characterData.appearance.facialFeatures}
                  onChange={handleChange}
                  className="w-full bg-dark-lighter border border-blood/50 rounded-none p-2 text-light focus:border-blood"
                >
                  <option value="">Select...</option>
                  {facialFeatures.map(feature => (
                    <option key={feature} value={feature}>{feature}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="appearance.markings" className="block text-light font-gothic mb-1">Markings</label>
                <select
                  id="appearance.markings"
                  name="appearance.markings"
                  value={characterData.appearance.markings}
                  onChange={handleChange}
                  className="w-full bg-dark-lighter border border-blood/50 rounded-none p-2 text-light focus:border-blood"
                >
                  <option value="">Select...</option>
                  {markings.map(marking => (
                    <option key={marking} value={marking}>{marking}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gothic text-blood-light">Your Dark Past</h2>
            <p className="text-light-darker">What shadows haunt you? What memories drive you forward?</p>
            
            <div>
              <label htmlFor="background" className="block text-light font-gothic mb-1">Character Background</label>
              <textarea
                id="background"
                name="background"
                value={characterData.background}
                onChange={handleChange}
                className="w-full h-40 bg-dark-lighter border border-blood/50 rounded-none p-2 text-light focus:border-blood"
                placeholder="Write your character's backstory..."
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto mt-6 px-4 pb-8">
      <h1 className="text-4xl font-gothic text-blood mb-8 text-center">
        Create Your Character
      </h1>
      
      <div className="card mb-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map(stepNumber => (
              <div 
                key={stepNumber}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-gothic border-2 ${
                  step === stepNumber 
                    ? 'bg-blood border-blood-light text-light' 
                    : step > stepNumber 
                      ? 'bg-dark-lighter border-blood/50 text-light-darker' 
                      : 'bg-dark-darker border-dark-lighter text-light-darker/50'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-dark-lighter">
            <div 
              className="absolute top-0 left-0 h-full bg-blood transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary"
                disabled={isLoading}
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary ml-auto"
                disabled={isLoading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary ml-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Character'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterCreation;
