import { PythonAdapter } from './python/PythonAdapter.js';
import { JavaAdapter } from './java/JavaAdapter.js';
import { CAdapter } from './c/CAdapter.js';
import { CppAdapter } from './cpp/CppAdapter.js';
import { JavaScriptAdapter } from './javascript/JavaScriptAdapter.js';
import { TypeScriptAdapter } from './typescript/TypeScriptAdapter.js';
import { SqlAdapter } from './sql/SqlAdapter.js';
import { GoAdapter } from './go/GoAdapter.js';

class LanguageFactory {
  constructor() {
    this.adapters = {
      python: new PythonAdapter(),
      javascript: new JavaScriptAdapter(),
      typescript: new TypeScriptAdapter(),
      java: new JavaAdapter(),
      c: new CAdapter(),
      cpp: new CppAdapter(),
      sql: new SqlAdapter(),
      go: new GoAdapter(),
    };
  }

  /**
   * Get the adapter for a given language
   * @param {string} language
   * @returns {LanguageAdapter}
   */
  getAdapter(language) {
    const lang = (language || '').toLowerCase().trim();
    const adapter = this.adapters[lang];
    if (!adapter) {
      // Return a safe fallback adapter if unsupported rather than crashing
      return this.adapters.python;
    }
    return adapter;
  }

  isSupported(language) {
    const lang = (language || '').toLowerCase().trim();
    return !!this.adapters[lang];
  }
}

export const languageFactory = new LanguageFactory();

