import React, { createContext, useContext, useState, useEffect } from 'react';
import { debugService } from '../services/debugService';



// Client-side quick inference heuristics
function quickInferLanguage(code) {
  if (!code || !code.trim()) return { name: 'python', confidence: 0, status: 'EMPTY_INPUT' };
  const trimmed = code.trim();

  if (/<\?php/i.test(trimmed)) return { name: 'php', confidence: 0.98, status: 'DETECTED' };
  if (/^\s*(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE)\b/i.test(trimmed)) return { name: 'sql', confidence: 0.95, status: 'DETECTED' };
  if (/#include\s*<iostream>|\bcout\s*<<|\bcin\s*>>|\bstd::/i.test(trimmed)) return { name: 'cpp', confidence: 0.96, status: 'DETECTED' };
  if (/#include\s*<stdio\.h>|\bprintf\s*\(|\bscanf\s*\(/i.test(trimmed)) return { name: 'c', confidence: 0.95, status: 'DETECTED' };
  if (/\bpublic\s+class\s+[a-zA-Z0-9_]+|System\.out\.print/i.test(trimmed)) return { name: 'java', confidence: 0.96, status: 'DETECTED' };
  if (/package\s+main\b|\bfmt\.(Println|Printf)/i.test(trimmed)) return { name: 'go', confidence: 0.96, status: 'DETECTED' };
  if (/\bfn\s+main\s*\(\s*\)|\bprintln!\s*\(/i.test(trimmed)) return { name: 'rust', confidence: 0.96, status: 'DETECTED' };
  if (/using\s+System;|\bConsole\.(WriteLine|ReadLine)/i.test(trimmed)) return { name: 'csharp', confidence: 0.96, status: 'DETECTED' };
  if (/\binterface\s+[A-Z]|\btype\s+[A-Z]|:\s*(string|number|boolean|any)\b/i.test(trimmed)) return { name: 'typescript', confidence: 0.92, status: 'DETECTED' };
  if (/\bconsole\.log\(|\bconst\s+[a-zA-Z0-9_$]+\s*=|=>|\bfunction\s+/i.test(trimmed)) return { name: 'javascript', confidence: 0.90, status: 'DETECTED' };
  if (/^\s*def\s+[a-zA-Z_]|\belif\s+|\bself\.|__init__|:\s*$/m.test(trimmed)) return { name: 'python', confidence: 0.95, status: 'DETECTED' };

  return { name: 'python', confidence: 0.60, status: 'AMBIGUOUS' };
}

const DebuggerContext = createContext(null);

export function DebuggerProvider({ children }) {
  const [sourceCode, setSourceCode] = useState(`def calculate_total(prices)
    total = 0
    for price in prices
        total += pric
    return total
`);
  const [selectedLanguage, setSelectedLanguage] = useState('auto'); // 'auto' or specific language
  const [detectedLanguage, setDetectedLanguage] = useState({ name: 'python', confidence: 0.95, status: 'DETECTED' });
  const [analysisStatus, setAnalysisStatus] = useState('IDLE'); // 'IDLE' | 'ANALYZING' | 'COMPLETED' | 'ERROR'
  const [statusMessage, setStatusMessage] = useState('Ready for analysis');
  const [errorsList, setErrorsList] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [editorMarkers, setEditorMarkers] = useState([]);
  const [activeStepLine, setActiveStepLine] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 4,
    minimap: false,
    wordWrap: 'on',
    lineNumbers: 'on',
  });
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [rawOutput, setRawOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('IDLE');
  const [testCases, setTestCases] = useState([]);
  const [expectedOutput, setExpectedOutput] = useState('');
  const [activeInspectorTab, setActiveInspectorTab] = useState('diagnostics');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  // Re-run lightweight inference when code changes if auto-mode is active
  useEffect(() => {
    if (selectedLanguage === 'auto') {
      const detected = quickInferLanguage(sourceCode);
      setDetectedLanguage(detected);
    } else {
      setDetectedLanguage({ name: selectedLanguage, confidence: 1.0, status: 'DETECTED' });
    }
  }, [sourceCode, selectedLanguage]);

  const activeLanguage = selectedLanguage === 'auto' ? (detectedLanguage?.name || 'python') : selectedLanguage;
  const language = activeLanguage;

  const getActiveFileName = (lang) => {
    const fileMap = {
      python: 'main.py',
      javascript: 'index.js',
      typescript: 'index.ts',
      java: 'Solution.java',
      c: 'main.c',
      cpp: 'main.cpp',
      go: 'main.go',
      rust: 'main.rs',
      php: 'index.php',
      csharp: 'Program.cs',
      sql: 'query.sql',
    };
    return fileMap[lang] || 'main.py';
  };
  const activeFileName = getActiveFileName(activeLanguage);

  const setLanguage = (lang) => {
    setSelectedLanguage(lang);
  };

  const analyzeCode = async () => {
    if (!sourceCode.trim()) {
      setStatusMessage('Please paste or write source code to analyze.');
      return;
    }

    setAnalysisStatus('ANALYZING');
    setAnalysisStage('ANALYZING');
    setStatusMessage('Analyzing syntax, static rules, and diagnostics...');
    setErrorsList([]);
    setEditorMarkers([]);

    try {
      const response = await debugService.analyzeCode({
        language: selectedLanguage === 'auto' ? undefined : selectedLanguage,
        sourceCode,
      });

      if (response.language) {
        setDetectedLanguage(response.language);
      }

      const receivedErrors = response.errors || (response.session?.aiAnalysis?.issues) || [];
      setErrorsList(receivedErrors);
      setCurrentSession(response.session || null);
      setAnalysisStatus('COMPLETED');
      setAnalysisStage('COMPLETED');

      if (receivedErrors.length === 0) {
        setStatusMessage('✓ Analysis completed. No errors detected.');
      } else {
        setStatusMessage(`${receivedErrors.length} ${receivedErrors.length === 1 ? 'error' : 'errors'} detected.`);
      }

      // Generate Monaco Editor markers
      const markers = receivedErrors.map((err) => ({
        startLineNumber: err.line || 1,
        startColumn: err.column || 1,
        endLineNumber: err.line || 1,
        endColumn: 120,
        message: `[${err.type}] ${err.message}`,
        severity: err.severity === 'CRITICAL' || err.severity === 'HIGH' ? 8 : (err.severity === 'MEDIUM' ? 4 : 2),
      }));
      setEditorMarkers(markers);

    } catch (err) {
      setAnalysisStatus('ERROR');
      setAnalysisStage('ERROR');
      setStatusMessage(err.response?.data?.message || err.message || 'Unable to analyze code. Please try again.');
    }
  };

  const executeCode = async () => {
    if (!sourceCode.trim()) return;
    setIsExecuting(true);
    try {
      const result = await debugService.runCode({
        language: activeLanguage,
        sourceCode,
      });
      setRawOutput(result);
    } catch (err) {
      setRawOutput({
        status: 'ERROR',
        stderr: err.response?.data?.message || err.message || 'Execution failed.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const runTests = async () => {
    if (!sourceCode.trim() || testCases.length === 0) return;
    try {
      const result = await debugService.runTestCases({
        language: activeLanguage,
        sourceCode,
        testCases,
      });
      return result;
    } catch (err) {
      console.warn('Test execution failed:', err);
    }
  };

  const clearCode = () => {
    setSourceCode('');
    setErrorsList([]);
    setEditorMarkers([]);
    setAnalysisStatus('IDLE');
    setAnalysisStage('IDLE');
    setStatusMessage('Code cleared.');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <DebuggerContext.Provider
      value={{
        sourceCode,
        setSourceCode,
        selectedLanguage,
        setSelectedLanguage,
        detectedLanguage,
        setDetectedLanguage,
        activeLanguage,
        language,
        setLanguage,
        activeFileName,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        editorSettings,
        setEditorSettings,
        editorTheme,
        setEditorTheme,
        analysisStatus,
        setAnalysisStatus,
        statusMessage,
        setStatusMessage,
        errorsList,
        setErrorsList,
        currentSession,
        setCurrentSession,
        editorMarkers,
        setEditorMarkers,
        activeStepLine,
        setActiveStepLine,
        copyFeedback,
        rawOutput,
        setRawOutput,
        isExecuting,
        setIsExecuting,
        isAnalyzing: analysisStatus === 'ANALYZING',
        analysisStage,
        setAnalysisStage,
        testCases,
        setTestCases,
        expectedOutput,
        setExpectedOutput,
        activeInspectorTab,
        setActiveInspectorTab,
        selectedIssueId,
        setSelectedIssueId,
        analyzeCode,
        executeCode,
        runTests,
        clearCode,
        copyCode,
      }}
    >
      {children}
    </DebuggerContext.Provider>
  );
}

export function useDebugger() {
  const context = useContext(DebuggerContext);
  if (!context) {
    throw new Error('useDebugger must be used within a DebuggerProvider');
  }
  return context;
}


