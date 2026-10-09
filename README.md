# AI Debugging Mentor 🎓🤖
### *An Intelligent System for Code Error Detection and Guidance*
*(Based on the IEEE Research Paper Concept: "AI Debugging Mentor: An Intelligent System for Code Error Detection and Guidance")*

---

## 🌟 Overview

**AI Debugging Mentor** is a full-stack, pedagogical code debugging platform built for beginner and intermediate programmers. Unlike simple generative AI chatbots that guess solutions, this system implements a deterministic-to-generative diagnostic pipeline:

```
INPUT CODE ➔ DETERMINISTIC AST & SYNTAX PARSER ➔ ISOLATED SANDBOX EXECUTION ➔ AI DEBUGGING ENGINE ➔ STRUCTURED PEDAGOGICAL GUIDANCE ➔ UNIFIED DIFF & CORRECTION ➔ LEARNING ANALYTICS
```

---

## 🚀 Key Features

1. **Multi-Stage Code Analysis**:
   - **Syntax Error Detection**: AST parsers for Python, Java, C, and C++ with exact line/column locations.
   - **Runtime Error Detection**: Safe, isolated sandbox execution capturing stderr tracebacks, zero divisions, null pointers, and index bounds.
   - **Logical Error Detection**: Compares runtime outputs with optional expected outputs and test case matrices.
   - **Static Code Quality Analyzer**: Identifies deep nesting, poor variable naming, deprecated functions, and code smells.

2. **Pedagogical Explanation Framework**:
   - **WHAT**: Plain-language description of what went wrong.
   - **WHERE**: Precise line number, column, and code snippet.
   - **WHY**: Conceptual reasoning behind the compiler or runtime failure.
   - **FIX**: Actionable instructions on how to correct the code.
   - **LEARN**: Core programming principle and grammar rule to master.
   - **PREVENTION**: Mentor advice to prevent repeating the mistake.

3. **Interactive Guided Resolution**:
   - **Unified Diff Viewer**: Side-by-side comparison between user code and corrected code with explicit `[Apply Fix]` control.
   - **Step-by-Step Resolution Guide**: Numbered, interactive checklist with **jump-to-line** synchronization in the Monaco Editor.
   - **3-Tier Progressive Hint Engine**: Tier 1 (Direction) ➔ Tier 2 (Specific Clue) ➔ Tier 3 (Solution) to foster active problem-solving without spoilers.

4. **Context-Aware AI Mentor Drawer**:
   - Interactive sliding chat drawer maintaining live context of the current editor code, language, and debugging diagnostics.
   - One-click quick prompts: *"Why is this wrong?"*, *"Explain like I'm a beginner"*, *"Give me a hint"*.

5. **Learning Analytics & Personalized Recommendations**:
   - Recharts visual dashboards for error frequencies, language distributions, and mastery scoring.
   - Dynamic recommendation engine generating starter practice problems targeted at the user's weak areas.

6. **Privacy-Preserving Administration**:
   - Admin dashboard providing aggregate platform telemetry while strictly shielding user source code from admin endpoints.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide React, Recharts, React Router DOM, Axios.
- **Backend**: Node.js, Express.js, Mongoose, Zod, BcryptJS, JSON Web Tokens (JWT), Helmet, Rate-Limit, Child-Process Sandbox.
- **Database**: MongoDB with automatic embedded `mongodb-memory-server` fallback for zero-configuration local runs.
- **AI Layer**: Configurable LLM engine supporting Google Gemini (`@google/generative-ai`), OpenAI, and rule-based heuristic AST fallback.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python 3.x (optional for local AST checks, built-in fallback provided)

### Step 1: Install Dependencies
```bash
# In the root directory:
npm run install:all
```

### Step 2: Configure Environment Variables
Copy or adjust `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai_debugging_mentor
JWT_SECRET=super_secret_jwt_key_ai_debugging_mentor_2026_dev_mode
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_AI_PROVIDER=gemini
SANDBOX_TIMEOUT_MS=5000
```

### Step 3: Run the Application
```bash
# Run both Server & Client concurrently:
npm run dev

# Or run separately:
npm run server   # Starts backend on http://localhost:5000
npm run client   # Starts frontend on http://localhost:5173
```

---

## 🧪 Running Automated Test Suites

```bash
cd server
npm test
```
Runs unit tests for language adapters, sandbox process isolation, timeout ceilings, and Zod AI schema validation.

---

## 📚 Demo Presets Included
- **Python Syntax Error**: Missing colon in function definition.
- **Python Logical Bug**: Off-by-one accumulator loop.
- **Java Syntax Error**: Missing statement semicolon.
- **Java Runtime Error**: `NullPointerException` on uninitialized object.
- **C Compilation Error**: Missing semicolon and header definitions.
- **C++ Logical / Bounds Bug**: Out-of-range vector iteration index.

---

## 📄 License
Educational and research use under MIT License.