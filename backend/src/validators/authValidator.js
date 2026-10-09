import { z } from 'zod';
import { EXPERIENCE_LEVELS, SUPPORTED_LANGUAGES } from '../config/constants.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().optional(),
    experienceLevel: z.enum(Object.values(EXPERIENCE_LEVELS)).optional(),
    preferredLanguages: z.array(z.enum(SUPPORTED_LANGUAGES)).optional(),
  }).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    experienceLevel: z.enum(Object.values(EXPERIENCE_LEVELS)).optional(),
    preferredLanguages: z.array(z.enum(SUPPORTED_LANGUAGES)).optional(),
  }),
});
