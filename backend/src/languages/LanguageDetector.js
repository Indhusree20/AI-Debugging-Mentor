/**
 * Production-grade Automatic Language Detection Engine
 * Uses deterministic lexical heuristics, keyword distributions, signature tokens,
 * and grammar constructs to accurately identify programming languages with confidence scores.
 */

export class LanguageDetector {
  static SUPPORTED_LANGUAGES = [
    'python',
    'javascript',
    'typescript',
    'java',
    'c',
    'cpp',
    'go',
    'rust',
    'php',
    'csharp',
    'sql'
  ];

  /**
   * Infer programming language from arbitrary source code text
   * @param {string} sourceCode
   * @param {string} [filenameHint]
   * @returns {{ language: string, confidence: number, status: 'DETECTED' | 'AMBIGUOUS' | 'UNSUPPORTED' | 'EMPTY_INPUT', candidateScores: Record<string, number> }}
   */
  static detect(sourceCode, filenameHint = '') {
    if (!sourceCode || typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
      return {
        language: 'python',
        confidence: 0,
        status: 'EMPTY_INPUT',
        candidateScores: {},
      };
    }

    // Check filename hint first if available
    if (filenameHint) {
      const extMatch = filenameHint.match(/\.([a-zA-Z0-9]+)$/);
      if (extMatch) {
        const ext = extMatch[1].toLowerCase();
        const extMap = {
          py: 'python',
          js: 'javascript',
          mjs: 'javascript',
          cjs: 'javascript',
          ts: 'typescript',
          tsx: 'typescript',
          jsx: 'javascript',
          java: 'java',
          c: 'c',
          h: 'c',
          cpp: 'cpp',
          cc: 'cpp',
          cxx: 'cpp',
          hpp: 'cpp',
          go: 'go',
          rs: 'rust',
          php: 'php',
          cs: 'csharp',
          sql: 'sql',
        };
        if (extMap[ext]) {
          return {
            language: extMap[ext],
            confidence: 0.99,
            status: 'DETECTED',
            candidateScores: { [extMap[ext]]: 100 },
          };
        }
      }
    }

    const code = sourceCode;
    const scores = {
      python: 0,
      javascript: 0,
      typescript: 0,
      java: 0,
      c: 0,
      cpp: 0,
      go: 0,
      rust: 0,
      php: 0,
      csharp: 0,
      sql: 0,
    };

    // 1. PHP Strong Signals
    if (/<\?php/i.test(code)) scores.php += 60;
    if (/\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/.test(code)) scores.php += 20;
    if (/\becho\s+["']/.test(code)) scores.php += 15;

    // 2. SQL Strong Signals
    const sqlKeywords = ['SELECT', 'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'GROUP BY', 'ORDER BY', 'HAVING', 'INNER JOIN', 'LEFT JOIN'];
    let sqlHits = 0;
    for (const kw of sqlKeywords) {
      const re = new RegExp(`\\b${kw}\\b`, 'i');
      if (re.test(code)) sqlHits++;
    }
    if (sqlHits >= 2) scores.sql += sqlHits * 20;
    if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(code)) scores.sql += 35;

    // 3. Python Strong Signals
    if (/^\s*def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*:/m.test(code)) scores.python += 45;
    if (/\bdef\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(code)) scores.python += 30;
    if (/^\s*elif\s+/m.test(code)) scores.python += 30;
    if (/^\s*import\s+[a-zA-Z_][a-zA-Z0-9_]*(\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*\s*$/m.test(code)) scores.python += 25;
    if (/^\s*from\s+[a-zA-Z_][a-zA-Z0-9_.]*\s+import\s+/m.test(code)) scores.python += 35;
    if (/\bself\.[a-zA-Z_]/.test(code)) scores.python += 25;
    if (/\bprint\s*\(/i.test(code) && !/System\.out\.print/i.test(code)) scores.python += 15;
    if (/\b(None|True|False)\b/.test(code)) scores.python += 20;
    if (/\b__init__\b/.test(code)) scores.python += 30;
    if (/\b(len|range|sum|enumerate|zip|isinstance)\s*\(/.test(code)) scores.python += 15;
    if (/:\s*(#.*)?$/m.test(code) && /(if|for|while|with|def|class)\b/.test(code)) scores.python += 20;

    // 4. Java Signals
    if (/\bpublic\s+class\s+[a-zA-Z0-9_]+/m.test(code)) scores.java += 40;
    if (/\bpublic\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]/m.test(code)) scores.java += 45;
    if (/System\.out\.print(ln)?\s*\(/.test(code)) scores.java += 35;
    if (/import\s+java\.[a-z0-9_.]+\s*;/m.test(code)) scores.java += 40;
    if (/\bpackage\s+[a-z0-9_.]+\s*;/m.test(code)) scores.java += 25;

    // 5. C & C++ Signals
    if (/#include\s*<stdio\.h>/i.test(code)) scores.c += 45;
    if (/#include\s*<stdlib\.h>/i.test(code)) scores.c += 35;
    if (/\bprintf\s*\(/.test(code)) { scores.c += 20; scores.cpp += 10; }
    if (/\bscanf\s*\(/.test(code)) { scores.c += 20; scores.cpp += 10; }
    if (/#include\s*<iostream>/i.test(code)) scores.cpp += 50;
    if (/#include\s*<vector>/i.test(code)) scores.cpp += 40;
    if (/std::cout|std::cin|std::endl|std::string|std::vector/.test(code)) scores.cpp += 45;
    if (/\bcout\s*<<|\bcin\s*>>/.test(code)) scores.cpp += 35;
    if (/\busing\s+namespace\s+std\s*;/.test(code)) scores.cpp += 40;

    // 6. Go Signals
    if (/package\s+main\b/.test(code)) scores.go += 45;
    if (/func\s+main\s*\(\s*\)/.test(code)) scores.go += 40;
    if (/func\s+\([a-zA-Z0-9_*]+\s+[a-zA-Z0-9_*]+\)/.test(code)) scores.go += 35;
    if (/fmt\.(Println|Printf|Sprintf)\s*\(/.test(code)) scores.go += 40;
    if (/:=\s*/.test(code)) scores.go += 25;
    if (/go\s+func\s*\(/.test(code)) scores.go += 30;

    // 7. Rust Signals
    if (/fn\s+main\s*\(\s*\)/.test(code)) scores.rust += 40;
    if (/\bprintln!\s*\(/.test(code)) scores.rust += 45;
    if (/\blet\s+mut\s+/.test(code)) scores.rust += 40;
    if (/\bpub\s+fn\s+/.test(code)) scores.rust += 30;
    if (/impl(\s+<[^>]+>)?\s+[a-zA-Z0-9_]+/.test(code)) scores.rust += 30;
    if (/->\s*(Result|Option)<[^>]+>/.test(code)) scores.rust += 35;

    // 8. C# Signals
    if (/using\s+System(\.[a-zA-Z0-9_]+)?\s*;/.test(code)) scores.csharp += 45;
    if (/Console\.(WriteLine|ReadLine|Write)\s*\(/.test(code)) scores.csharp += 40;
    if (/\bnamespace\s+[a-zA-Z0-9_.]+\s*\{/.test(code)) scores.csharp += 20;
    if (/\bstatic\s+void\s+Main\s*\(\s*string\s*\[\s*\]\s*args\s*\)/i.test(code)) scores.csharp += 45;

    // 9. JavaScript & TypeScript Signals
    if (/\bconsole\.log\s*\(/.test(code)) { scores.javascript += 20; scores.typescript += 20; }
    if (/\bconst\s+[a-zA-Z0-9_$]+\s*=\s*/.test(code)) { scores.javascript += 15; scores.typescript += 15; }
    if (/\blet\s+[a-zA-Z0-9_$]+\s*=\s*/.test(code)) { scores.javascript += 15; scores.typescript += 15; }
    if (/\bfunction\s+[a-zA-Z0-9_$]+\s*\(/.test(code)) { scores.javascript += 10; scores.typescript += 10; }
    if (/=>\s*\{?/.test(code)) { scores.javascript += 10; scores.typescript += 10; }
    if (/require\s*\(\s*['"][^'"]+['"]\s*\)/.test(code)) scores.javascript += 25;
    if (/module\.exports\s*=/.test(code)) scores.javascript += 25;

    // TypeScript Specific
    if (/\binterface\s+[A-Z][a-zA-Z0-9_]*\s*\{/.test(code)) scores.typescript += 35;
    if (/\btype\s+[A-Z][a-zA-Z0-9_]*\s*=\s*/.test(code)) scores.typescript += 30;
    if (/:\s*(string|number|boolean|any|void|unknown|never)\b/.test(code)) scores.typescript += 35;
    if (/as\s+(string|number|const|any)\b/.test(code)) scores.typescript += 25;

    // Sort by scores descending
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [topLang, topScore] = sorted[0];
    const [secondLang, secondScore] = sorted[1];

    if (topScore === 0) {
      // Default fallback when code is completely generic
      return {
        language: 'python',
        confidence: 0.50,
        status: 'AMBIGUOUS',
        candidateScores: scores,
      };
    }

    let confidence;
    if (secondScore === 0) {
      confidence = Math.min(0.99, Math.max(0.80, Math.round((topScore / (topScore + 4)) * 100) / 100));
    } else {
      confidence = Math.min(0.99, Math.max(0.55, Math.round((topScore / (topScore + (secondScore * 0.5) + 5)) * 100) / 100));
    }
    const isAmbiguous = (secondScore > 0 && (topScore - secondScore) < 15) || confidence < 0.70;

    return {
      language: topLang,
      confidence,
      status: isAmbiguous ? 'AMBIGUOUS' : 'DETECTED',
      candidateScores: scores,
    };
  }
}
