import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Lightweight Zero-Dependency In-Memory Store
 * Activates seamlessly when no external MongoDB instance is present,
 * avoiding large binary downloads while supporting all schema operations.
 */
class MemoryStore {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.analytics = new Map();
    this.recommendations = new Map();
    this.problems = new Map();
    this.submissions = new Map();
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  // Problem methods
  async problemFind(query = {}) {
    const results = [];
    for (const prob of this.problems.values()) {
      const probIsActive = prob.isActive !== undefined ? prob.isActive : true;
      if (query.isActive !== undefined && probIsActive !== query.isActive) continue;
      if (query.difficulty && prob.difficulty !== query.difficulty) continue;
      if (query.topic && prob.topic !== query.topic) continue;
      if (query.supportedLanguages && !prob.supportedLanguages?.includes(query.supportedLanguages)) continue;
      if (query.$or) {
        let matchOr = false;
        for (const branch of query.$or) {
          if (branch.title?.$regex) {
            const re = new RegExp(branch.title.$regex, 'i');
            if (re.test(prob.title)) matchOr = true;
          }
          if (branch.statement?.$regex) {
            const re = new RegExp(branch.statement.$regex, 'i');
            if (re.test(prob.statement)) matchOr = true;
          }
          if (branch.topic?.$regex) {
            const re = new RegExp(branch.topic.$regex, 'i');
            if (re.test(prob.topic)) matchOr = true;
          }
          if (branch.slug && prob.slug === branch.slug) matchOr = true;
          if (branch._id && (prob._id === branch._id || prob._id === branch._id?.toString())) matchOr = true;
        }
        if (!matchOr) continue;
      }
      results.push(prob);
    }
    results.sort((a, b) => (a.order || 0) - (b.order || 0));
    return results;
  }

  async problemFindOne(query = {}) {
    for (const prob of this.problems.values()) {
      const probIsActive = prob.isActive !== undefined ? prob.isActive : true;
      if (query.isActive !== undefined && probIsActive !== query.isActive) continue;
      if (query.slug && prob.slug === query.slug.toLowerCase()) return prob;
      if (query._id && (prob._id === query._id || prob._id === query._id?.toString())) return prob;
      if (query.$or) {
        for (const branch of query.$or) {
          if (branch.slug && prob.slug === branch.slug.toLowerCase()) return prob;
          if (branch._id && (prob._id === branch._id || prob._id === branch._id?.toString())) return prob;
        }
      }
    }
    return null;
  }

  async problemFindOneAndUpdate(query, update, options = {}) {
    let prob = await this.problemFindOne(query);
    if (!prob && options.upsert) {
      const id = this.generateId();
      prob = {
        _id: id,
        id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(update.$set || update),
      };
      this.problems.set(prob.slug, prob);
      return prob;
    }
    if (prob) {
      Object.assign(prob, update.$set || update);
      prob.updatedAt = new Date();
      return prob;
    }
    return null;
  }

  // Submission methods
  async submissionCreate(data) {
    const id = this.generateId();
    const sub = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.submissions.set(id, sub);
    return sub;
  }

  async submissionFind(query = {}) {
    const results = [];
    const userIdStr = query.userId?.toString();
    for (const sub of this.submissions.values()) {
      if (userIdStr && sub.userId?.toString() !== userIdStr) continue;
      if (query.problemSlug && sub.problemSlug !== query.problemSlug) continue;
      if (query.problemId && sub.problemId?.toString() !== query.problemId?.toString()) continue;
      if (query.status && sub.status !== query.status) continue;
      results.push(sub);
    }
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  }

  // User methods
  async userCreate(data) {
    const id = this.generateId();
    const userDoc = {
      _id: id,
      id,
      name: data.name,
      email: (data.email || '').toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || 'USER',
      experienceLevel: data.experienceLevel || 'BEGINNER',
      preferredLanguages: data.preferredLanguages || ['python'],
      createdAt: new Date(),
      updatedAt: new Date(),
      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.passwordHash);
      },
      async save() {
        this.updatedAt = new Date();
        return this;
      }
    };
    this.users.set(id, userDoc);
    return userDoc;
  }

  async userFindOne(query) {
    for (const user of this.users.values()) {
      if (query.email && user.email === (query.email || '').toLowerCase()) {
        return user;
      }
      if (query._id && (user._id === query._id || user._id === query._id?.toString())) {
        return user;
      }
    }
    return null;
  }

  async userFindById(id) {
    const idStr = id?.toString();
    const user = this.users.get(idStr);
    return user || null;
  }

  // Session methods
  async sessionCreate(data) {
    const id = this.generateId();
    const sessionDoc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      async save() {
        this.updatedAt = new Date();
        return this;
      }
    };
    this.sessions.set(id, sessionDoc);
    return sessionDoc;
  }

  async sessionFind(query = {}) {
    const results = [];
    const userIdStr = query.userId?.toString();

    for (const sess of this.sessions.values()) {
      if (userIdStr && sess.userId?.toString() !== userIdStr) continue;
      if (query.language && sess.language !== query.language) continue;
      if (query['aiAnalysis.primaryErrorType'] && sess.aiAnalysis?.primaryErrorType !== query['aiAnalysis.primaryErrorType']) continue;
      
      if (query.$or) {
        const search = query.$or[0]?.title?.$regex;
        if (search) {
          const re = new RegExp(search, 'i');
          const matches = re.test(sess.title) || re.test(sess.sourceCode) || re.test(sess.aiAnalysis?.summary || '');
          if (!matches) continue;
        }
      }

      results.push(sess);
    }

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  }

  async sessionFindOne(query) {
    const list = await this.sessionFind(query);
    if (query._id) {
      const idStr = query._id?.toString();
      return list.find(s => s._id === idStr) || null;
    }
    return list[0] || null;
  }

  async sessionFindOneAndDelete(query) {
    const session = await this.sessionFindOne(query);
    if (session) {
      this.sessions.delete(session._id);
      return session;
    }
    return null;
  }

  // Analytics methods
  async analyticsFindOne(query) {
    const userIdStr = query.userId?.toString();
    for (const an of this.analytics.values()) {
      if (an.userId?.toString() === userIdStr) {
        return an;
      }
    }
    return null;
  }

  async analyticsCreate(data) {
    const id = this.generateId();
    const analyticsDoc = {
      _id: id,
      id,
      userId: data.userId,
      totalSessions: data.totalSessions || 0,
      errorsDetected: data.errorsDetected || 0,
      errorsFixed: data.errorsFixed || 0,
      successRate: data.successRate || 0,
      languageBreakdown: { python: 0, java: 0, c: 0, cpp: 0, ...(data.languageBreakdown || {}) },
      errorTypeFrequency: {
        SYNTAX_ERROR: 0,
        LOGICAL_ERROR: 0,
        RUNTIME_ERROR: 0,
        TYPE_ERROR: 0,
        COMPILATION_ERROR: 0,
        IMPORT_ERROR: 0,
        NAME_ERROR: 0,
        INDEX_ERROR: 0,
        NULL_REFERENCE: 0,
        INFINITE_LOOP: 0,
        PERFORMANCE_ISSUE: 0,
        CODE_QUALITY_ISSUE: 0,
        ...(data.errorTypeFrequency || {})
      },
      masteryScores: data.masteryScores || [
        { topic: 'Syntax & Formatting', score: 60 },
        { topic: 'Conditionals & Logic', score: 50 },
        { topic: 'Loops & Iteration', score: 40 },
        { topic: 'Arrays & Data Structures', score: 30 },
        { topic: 'Functions & Methods', score: 50 },
      ],
      lastActive: new Date(),
      async save() {
        return this;
      }
    };
    this.analytics.set(id, analyticsDoc);
    return analyticsDoc;
  }

  async analyticsUpdateOne(query, update) {
    const an = await this.analyticsFindOne(query);
    if (an && update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        an[key] = (an[key] || 0) + val;
      }
    }
    return an;
  }

  // Recommendations methods
  async recommendationFind(query) {
    const userIdStr = query.userId?.toString();
    const results = [];
    for (const rec of this.recommendations.values()) {
      if (userIdStr && rec.userId?.toString() !== userIdStr) continue;
      if (query.isCompleted !== undefined && rec.isCompleted !== query.isCompleted) continue;
      results.push(rec);
    }
    return results;
  }

  async recommendationInsertMany(items) {
    const created = [];
    for (const item of items) {
      const id = this.generateId();
      const doc = { _id: id, id, ...item, isCompleted: false, createdAt: new Date() };
      this.recommendations.set(id, doc);
      created.push(doc);
    }
    return created;
  }

  async recommendationFindOneAndUpdate(query, update) {
    const list = await this.recommendationFind({ userId: query.userId });
    const target = list.find(r => r._id === query._id?.toString());
    if (target) {
      if (update.isCompleted !== undefined) target.isCompleted = update.isCompleted;
      return target;
    }
    return null;
  }
}

export const memoryStore = new MemoryStore();
