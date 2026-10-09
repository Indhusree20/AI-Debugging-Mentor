import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { LearningAnalytics } from '../models/LearningAnalytics.js';
import { config } from '../config/index.js';

function generateToken(id) {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, experienceLevel, preferredLanguages } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      experienceLevel: experienceLevel || 'BEGINNER',
      preferredLanguages: preferredLanguages || ['python'],
    });

    // Initialize learning analytics record for the new user
    await LearningAnalytics.create({
      userId: user._id,
      masteryScores: [
        { topic: 'Syntax & Formatting', score: 60 },
        { topic: 'Conditionals & Logic', score: 50 },
        { topic: 'Loops & Iteration', score: 40 },
        { topic: 'Arrays & Data Structures', score: 30 },
        { topic: 'Functions & Methods', score: 50 },
      ],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        experienceLevel: user.experienceLevel,
        preferredLanguages: user.preferredLanguages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        experienceLevel: user.experienceLevel,
        preferredLanguages: user.preferredLanguages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        experienceLevel: user.experienceLevel,
        preferredLanguages: user.preferredLanguages,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, experienceLevel, preferredLanguages } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (preferredLanguages) user.preferredLanguages = preferredLanguages;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        experienceLevel: user.experienceLevel,
        preferredLanguages: user.preferredLanguages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}


