import mongoose from 'mongoose';
import { config } from './index.js';
import { memoryStore } from './memoryStore.js';
import { User } from '../models/User.js';
import { DebuggingSession } from '../models/DebuggingSession.js';
import { LearningAnalytics } from '../models/LearningAnalytics.js';
import { Recommendation } from '../models/Recommendation.js';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';

let isUsingMemoryStore = false;

export async function connectDB() {
  try {
    // Attempt connecting to the configured MongoDB URI with a 1.5s server selection timeout
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[Database] Connected successfully to external MongoDB at ${config.mongoUri}`);
  } catch (err) {
    console.warn(`[Database] External MongoDB not active (${err.message}). Activating built-in In-Memory Datastore...`);
    activateMemoryStoreShim();
    isUsingMemoryStore = true;
    console.log(`[Database] In-Memory Datastore Active (Fast zero-download standalone mode ready).`);
  }

  mongoose.connection.on('error', (err) => {
    if (!isUsingMemoryStore) {
      console.error('[Database] MongoDB connection error:', err);
    }
  });
}

function activateMemoryStoreShim() {
  // Patch User model
  User.create = async (data) => memoryStore.userCreate(data);
  User.findOne = (query) => {
    return {
      select: () => memoryStore.userFindOne(query),
      then: (resolve, reject) => memoryStore.userFindOne(query).then(resolve, reject),
    };
  };
  User.findById = async (id) => memoryStore.userFindById(id);
  User.countDocuments = async () => memoryStore.users.size;
  User.aggregate = async () => [];

  // Patch DebuggingSession model
  DebuggingSession.create = async (data) => memoryStore.sessionCreate(data);
  DebuggingSession.find = (query) => {
    const p = memoryStore.sessionFind(query);
    return {
      sort: () => ({
        skip: () => ({
          limit: () => ({
            select: async () => p,
            then: (res, rej) => p.then(res, rej),
          }),
          select: async () => p,
          then: (res, rej) => p.then(res, rej),
        }),
        limit: (n) => ({
          select: async () => (await p).slice(0, n),
          then: (res, rej) => p.then((arr) => res(arr.slice(0, n)), rej),
        }),
      }),
      then: (res, rej) => p.then(res, rej),
    };
  };
  DebuggingSession.findOne = async (query) => memoryStore.sessionFindOne(query);
  DebuggingSession.findOneAndDelete = async (query) => memoryStore.sessionFindOneAndDelete(query);
  DebuggingSession.countDocuments = async () => memoryStore.sessions.size;
  DebuggingSession.aggregate = async () => [];

  // Patch LearningAnalytics model
  LearningAnalytics.findOne = async (query) => memoryStore.analyticsFindOne(query);
  LearningAnalytics.create = async (data) => memoryStore.analyticsCreate(data);
  LearningAnalytics.updateOne = async (query, update) => memoryStore.analyticsUpdateOne(query, update);
  LearningAnalytics.countDocuments = async () => memoryStore.analytics.size;

  // Patch Recommendation model
  Recommendation.find = (query) => {
    const p = memoryStore.recommendationFind(query);
    return {
      sort: () => p,
      limit: async (n) => (await p).slice(0, n),
      then: (res, rej) => p.then(res, rej),
    };
  };
  Recommendation.insertMany = async (items) => memoryStore.recommendationInsertMany(items);
  Recommendation.findOneAndUpdate = async (query, update) => memoryStore.recommendationFindOneAndUpdate(query, update);

  // Patch Problem model
  Problem.find = (query) => {
    const p = memoryStore.problemFind(query);
    return {
      sort: () => p,
      then: (res, rej) => p.then(res, rej),
    };
  };
  Problem.findOne = async (query) => memoryStore.problemFindOne(query);
  Problem.findOneAndUpdate = async (query, update, options) => memoryStore.problemFindOneAndUpdate(query, update, options);
  Problem.countDocuments = async (query) => (await memoryStore.problemFind(query)).length;

  // Patch Submission model
  Submission.create = async (data) => memoryStore.submissionCreate(data);
  Submission.find = (query) => {
    const p = memoryStore.submissionFind(query);
    return {
      sort: () => ({
        limit: async (n) => (await p).slice(0, n),
        select: async () => p,
        then: (res, rej) => p.then(res, rej),
      }),
      select: async () => p,
      then: (res, rej) => p.then(res, rej),
    };
  };
  Submission.findOne = async (query) => (await memoryStore.submissionFind(query))[0] || null;
  Submission.countDocuments = async (query) => (await memoryStore.submissionFind(query)).length;
}

export async function disconnectDB() {
  if (!isUsingMemoryStore) {
    await mongoose.disconnect();
  }
}
