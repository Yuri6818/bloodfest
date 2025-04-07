import { Schema, model } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password: string;
  character?: {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    inventory: string[];
    completedQuests: string[];
  };
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  character: {
    name: String,
    level: { type: Number, default: 1 },
    health: { type: Number, default: 100 },
    maxHealth: { type: Number, default: 100 },
    experience: { type: Number, default: 0 },
    inventory: [String],
    completedQuests: [String]
  }
});

export const User = model<IUser>('User', userSchema);