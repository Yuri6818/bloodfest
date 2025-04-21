import { Router, Request, Response } from 'express';
import { Character, CharacterClasses, ICharacterClass } from '../models/Character.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all character routes
router.use(authMiddleware);

// Get character information
router.get('/info', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Get user with populated character
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has a character
    if (!user.character) {
      return res.status(404).json({ 
        message: 'No character found for this user',
        hasCharacter: false
      });
    }
    
    // Get detailed character information from Character model
    const character = await Character.findOne({ userId })
      .populate('inventory')
      .populate('equippedItems.weapon')
      .populate('equippedItems.armor')
      .populate('equippedItems.amulet')
      .populate('equippedItems.ring')
      .populate('equippedItems.trinket')
      .lean();
      
    if (!character) {
      return res.status(404).json({ 
        message: 'Character not found',
        hasCharacter: false 
      });
    }
    
    res.json({ 
      hasCharacter: true,
      character 
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: 'Failed to retrieve character information' });
  }
});

// Create a new character
router.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, characterClass, appearance, background } = req.body;
    
    // Validation
    if (!name || !characterClass) {
      return res.status(400).json({ message: 'Name and character class are required' });
    }
    
    // Check if user already has a character
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (existingUser.character) {
      return res.status(400).json({ message: 'User already has a character' });
    }
    
    // Validate character class
    if (!CharacterClasses[characterClass]) {
      return res.status(400).json({ message: 'Invalid character class' });
    }
    
    const classData = CharacterClasses[characterClass];
    
    // Create new character with class-specific stats and abilities
    const character = new Character({
      userId,
      name,
      class: characterClass,
      health: classData.baseStats.health,
      maxHealth: classData.baseStats.health,
      strength: classData.baseStats.strength,
      dexterity: classData.baseStats.dexterity,
      intelligence: classData.baseStats.intelligence,
      willpower: classData.baseStats.willpower,
      abilities: classData.startingAbilities,
      appearance,
      background,
      inventory: [],
      bloodLust: 0,
      moonRage: 0,
      soulEnergy: 0,
      faithPower: 0,
      corruption: 0
    });
    
    // Add class-specific resource
    switch (characterClass) {
      case 'Vampire':
        character.bloodLust = 0;
        break;
      case 'Werewolf':
        character.moonRage = 0;
        break;
      case 'Necromancer':
        character.soulEnergy = 0;
        break;
      case 'Witch Hunter':
        character.faithPower = 0;
        break;
      case 'Cultist':
        character.corruption = 0;
        break;
    }
    
    // Save character
    const savedCharacter = await character.save();
    
    // Update user with character reference
    existingUser.character = savedCharacter._id;
    await existingUser.save();
    
    // Return character info
    res.status(201).json({ 
      message: 'Character created successfully',
      character: savedCharacter
    });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ message: 'Failed to create character' });
  }
});

// Get available character classes
router.get('/classes', (req: Request, res: Response) => {
  try {
    const classes = Object.keys(CharacterClasses).map(key => ({
      id: key,
      name: CharacterClasses[key].name,
      description: CharacterClasses[key].description,
      baseStats: CharacterClasses[key].baseStats,
      specialResource: CharacterClasses[key].specialResource,
      startingAbilities: CharacterClasses[key].startingAbilities
    }));
    
    res.json({ classes });
  } catch (error) {
    console.error('Error fetching character classes:', error);
    res.status(500).json({ message: 'Failed to retrieve character classes' });
  }
});

// Update character appearance
router.put('/appearance', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { appearance } = req.body;
    
    if (!appearance) {
      return res.status(400).json({ message: 'Appearance details are required' });
    }
    
    const character = await Character.findOne({ userId });
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Update appearance
    character.appearance = {
      ...character.appearance as object,
      ...appearance
    };
    
    await character.save();
    
    res.json({ 
      message: 'Character appearance updated',
      appearance: character.appearance 
    });
  } catch (error) {
    console.error('Error updating character appearance:', error);
    res.status(500).json({ message: 'Failed to update character appearance' });
  }
});

// Update character background
router.put('/background', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { background } = req.body;
    
    if (!background) {
      return res.status(400).json({ message: 'Background is required' });
    }
    
    const character = await Character.findOne({ userId });
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Update background
    character.background = background;
    await character.save();
    
    res.json({ 
      message: 'Character background updated',
      background: character.background 
    });
  } catch (error) {
    console.error('Error updating character background:', error);
    res.status(500).json({ message: 'Failed to update character background' });
  }
});

// Delete character
router.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Find and delete character
    const deletedCharacter = await Character.findOneAndDelete({ userId });
    
    if (!deletedCharacter) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Update user document
    await User.findByIdAndUpdate(userId, { $unset: { character: 1 } });
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ message: 'Failed to delete character' });
  }
});

export default router; 