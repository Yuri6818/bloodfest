import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Item, IconicItems } from '../models/Item.js';
import { Quest, SampleQuests } from '../models/Quest.js';
import { CharacterClasses } from '../models/Character.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodfest');
    console.log('Connected to MongoDB for seeding');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearCollections = async () => {
  try {
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Character.deleteMany({});
    await Item.deleteMany({});
    await Quest.deleteMany({});
    console.log('All collections cleared');
  } catch (error) {
    console.error('Error clearing collections:', error);
    process.exit(1);
  }
};

// Seed test users
const seedUsers = async () => {
  try {
    console.log('Seeding test users...');
    
    const hashedPassword = await hash('Password123', 12);
    
    const users = [
      {
        username: 'test_user',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        lastLogin: new Date()
      },
      {
        username: 'vampire_lord',
        email: 'vampire@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        lastLogin: new Date()
      },
      {
        username: 'witch_hunter',
        email: 'hunter@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        lastLogin: new Date()
      }
    ];
    
    await User.insertMany(users);
    console.log('Test users seeded');
    
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Seed items
const seedItems = async () => {
  try {
    console.log('Seeding items...');
    
    const items = await Item.insertMany(IconicItems);
    console.log(`${items.length} items seeded`);
    
    return items;
  } catch (error) {
    console.error('Error seeding items:', error);
    process.exit(1);
  }
};

// Seed quests
const seedQuests = async () => {
  try {
    console.log('Seeding quests...');
    
    const quests = await Quest.insertMany(SampleQuests);
    console.log(`${quests.length} quests seeded`);
    
    return quests;
  } catch (error) {
    console.error('Error seeding quests:', error);
    process.exit(1);
  }
};

// Seed characters
const seedCharacters = async (users, items) => {
  try {
    console.log('Seeding characters...');
    
    // Find users
    const testUser = await User.findOne({ username: 'test_user' });
    const vampireUser = await User.findOne({ username: 'vampire_lord' });
    const hunterUser = await User.findOne({ username: 'witch_hunter' });
    
    // Find some items for equipment
    const vampireWeapon = items.find(item => item.name === 'Bloodthirster');
    const vampireAmulet = items.find(item => item.name === 'Crimson Tear Pendant');
    const hunterRing = items.find(item => item.name === 'Ring of Blessed Silver');
    
    const characters = [
      {
        userId: vampireUser._id,
        name: 'Lord Draconis',
        class: 'Vampire',
        level: 5,
        experience: 1200,
        health: 100,
        maxHealth: 100,
        bloodLust: 50,
        strength: CharacterClasses.Vampire.baseStats.strength + 2,
        dexterity: CharacterClasses.Vampire.baseStats.dexterity + 1,
        intelligence: CharacterClasses.Vampire.baseStats.intelligence,
        willpower: CharacterClasses.Vampire.baseStats.willpower,
        abilities: [...CharacterClasses.Vampire.startingAbilities, 'Bat Form', 'Blood Frenzy'],
        equippedItems: {
          weapon: vampireWeapon ? vampireWeapon._id : null,
          amulet: vampireAmulet ? vampireAmulet._id : null
        },
        appearance: {
          hairStyle: 'Long, flowing',
          hairColor: 'Midnight black',
          facialFeatures: 'Sharp, aristocratic',
          skinTone: 'Deathly pale',
          markings: 'Small scar across left cheek'
        },
        background: 'Born into nobility during the 17th century, Lord Draconis was turned during a midnight ball by a mysterious countess. He has wandered the shadows ever since, cultivating power and influence.',
        createdAt: new Date(),
        lastPlayed: new Date()
      },
      {
        userId: hunterUser._id,
        name: 'Sister Ravena',
        class: 'Witch Hunter',
        level: 4,
        experience: 950,
        health: 110,
        maxHealth: 110,
        faithPower: 65,
        strength: CharacterClasses['Witch Hunter'].baseStats.strength + 1,
        dexterity: CharacterClasses['Witch Hunter'].baseStats.dexterity,
        intelligence: CharacterClasses['Witch Hunter'].baseStats.intelligence,
        willpower: CharacterClasses['Witch Hunter'].baseStats.willpower + 2,
        abilities: [...CharacterClasses['Witch Hunter'].startingAbilities, 'Purifying Flame'],
        equippedItems: {
          ring: hunterRing ? hunterRing._id : null
        },
        appearance: {
          hairStyle: 'Short, practical',
          hairColor: 'Auburn',
          facialFeatures: 'Stern, determined',
          skinTone: 'Weathered',
          markings: 'Holy symbol branded on right palm'
        },
        background: 'Orphaned when vampires razed her village, Ravena was taken in by the Order of Silver Light. She has devoted her life to hunting the darkness that stole her family, following a path of righteous vengeance.',
        createdAt: new Date(),
        lastPlayed: new Date()
      }
    ];
    
    const createdCharacters = await Character.insertMany(characters);
    
    // Update user documents with character references
    await User.findByIdAndUpdate(vampireUser._id, {
      character: createdCharacters[0]
    });
    
    await User.findByIdAndUpdate(hunterUser._id, {
      character: createdCharacters[1]
    });
    
    console.log(`${createdCharacters.length} characters seeded`);
  } catch (error) {
    console.error('Error seeding characters:', error);
    process.exit(1);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearCollections();
    const users = await seedUsers();
    const items = await seedItems();
    const quests = await seedQuests();
    await seedCharacters(users, items);
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase(); 