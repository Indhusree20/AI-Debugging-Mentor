import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { EXPERIENCE_LEVELS, USER_ROLES, SUPPORTED_LANGUAGES } from '../config/constants.js';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password hash'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    experienceLevel: {
      type: String,
      enum: Object.values(EXPERIENCE_LEVELS),
      default: EXPERIENCE_LEVELS.BEGINNER,
    },
    preferredLanguages: {
      type: [String],
      enum: SUPPORTED_LANGUAGES,
      default: ['python'],
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model('User', UserSchema);
