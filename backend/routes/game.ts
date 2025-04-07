import { Router } from 'express';
import { verify } from 'jsonwebtoken';
import { User } from '../models/User';
import { generateEnemyStats, calculateExperience } from '../utils/gameLogic';

const router = Router();

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Character routes
router.get('/character/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user?.character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/character/:characterId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ 'character.id': req.params.characterId });
    if (!user) {
      return res.status(404).json({ message: 'Character not found' });
    }

    Object.assign(user.character, req.body);
    await user.save();
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Combat routes
router.get('/combat/initialize/:level', authenticateToken, async (req, res) => {
  try {
    const enemy = generateEnemyStats(parseInt(req.params.level));
    res.json(enemy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/combat/damage/:characterId', authenticateToken, async (req, res) => {
  try {
    const { damage } = req.body;
    const user = await User.findOne({ 'character.id': req.params.characterId });
    
    if (!user?.character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    user.character.health = Math.max(0, user.character.health - damage);
    if (user.character.health === 0) {
      user.character.health = user.character.maxHealth;
      user.character.experience = Math.max(0, user.character.experience - 50);
    }

    await user.save();
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/combat/reward/:characterId', authenticateToken, async (req, res) => {
  try {
    const { experience, loot } = req.body;
    const user = await User.findOne({ 'character.id': req.params.characterId });
    
    if (!user?.character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    user.character.experience += experience;
    if (loot) {
      user.character.inventory.push(...loot);
    }

    // Check for level up
    const experienceToLevel = calculateExperience(user.character.level);
    if (user.character.experience >= experienceToLevel) {
      user.character.level += 1;
      user.character.maxHealth += 20;
      user.character.health = user.character.maxHealth;
    }

    await user.save();
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Inventory routes
router.post('/character/:characterId/equip', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findOne({ 'character.id': req.params.characterId });
    
    if (!user?.character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const item = user.character.inventory.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    switch (item.type) {
      case 'weapon':
        user.character.equipment.weapon = item;
        break;
      case 'armor':
        user.character.equipment.armor = item;
        break;
      case 'accessory':
        user.character.equipment.accessory = item;
        break;
      default:
        return res.status(400).json({ message: 'Item cannot be equipped' });
    }

    user.character.inventory = user.character.inventory.filter(i => i.id !== itemId);
    await user.save();
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/character/:characterId/unequip', authenticateToken, async (req, res) => {
  try {
    const { slot } = req.body;
    const user = await User.findOne({ 'character.id': req.params.characterId });
    
    if (!user?.character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const item = user.character.equipment[slot];
    if (!item) {
      return res.status(404).json({ message: 'No item equipped in that slot' });
    }

    user.character.inventory.push(item);
    user.character.equipment[slot] = undefined;
    await user.save();
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/character/:characterId/use-item', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findOne({ 'character.id': req.params.characterId });
    
    if (!user?.character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const itemIndex = user.character.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = user.character.inventory[itemIndex];
    if (item.type !== 'consumable') {
      return res.status(400).json({ message: 'Item cannot be used' });
    }

    // Apply item effects
    if (item.effects) {
      item.effects.forEach(effect => {
        if (effect.type === 'heal') {
          user.character.health = Math.min(
            user.character.maxHealth,
            user.character.health + effect.value
          );
        }
      });
    }

    user.character.inventory.splice(itemIndex, 1);
    await user.save();
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/character/:characterId/drop-item', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findOne({ 'character.id': req.params.characterId });
    
    if (!user?.character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    user.character.inventory = user.character.inventory.filter(i => i.id !== itemId);
    await user.save();
    res.json(user.character);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;