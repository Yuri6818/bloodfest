import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  character: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false // Don't return password by default
    },
    character: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      default: null
    } as any // Type assertion to bypass the TypeScript error
  },
  {
    timestamps: true
  }
);

export const User = model<IUser>('User', userSchema);