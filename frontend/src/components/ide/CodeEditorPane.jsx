import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { useTheme } from '../../contexts/ThemeContext';

export function CodeEditorPane() {
  const {
    language,
    sourceCode,
    setSourceCode,
    editorMarkers,
    activeStepLine,
    editorSettings,
  } = useDebugger();
  const { theme } = useTheme();

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define Commercial Dark theme (Zinc surfaces)
    monaco.editor.defineTheme('mentor-zinc-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
        { token: 'keyword', foreground: '60a5fa', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'type', foreground: 'a78bfa' },
      ],
      colors: {
        'editor.background': '#0e0e12',
        'editor.foreground': '#f4f4f5',
        'editorLineNumber.foreground': '#3f3f46',
        'editorLineNumber.activeForeground': '#60a5fa',
        'editor.selectionBackground': '#2563eb30',
        'editor.lineHighlightBackground': '#18181b80',
        'editorCursor.foreground': '#60a5fa',
        'editorWhitespace.foreground': '#27272a',
        'editorGutter.background': '#0e0e12',
      },
    });

    // Define Commercial Light theme
    monaco.editor.defineTheme('mentor-zinc-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: 'a1a1aa', fontStyle: 'italic' },
        { token: 'keyword', foreground: '2563eb', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'd97706' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#18181b',
        'editorLineNumber.foreground': '#a1a1aa',
        'editorLineNumber.activeForeground': '#2563eb',
        'editor.selectionBackground': '#bfdbfe50',
        'editor.lineHighlightBackground': '#f4f4f5',
        'editorCursor.foreground': '#2563eb',
        'editorGutter.background': '#ffffff',
      },
    });

    monaco.editor.setTheme(theme === 'dark' ? 'mentor-zinc-dark' : 'mentor-zinc-light');
  };

  // Sync theme
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'mentor-zinc-dark' : 'mentor-zinc-light');
    }
  }, [theme]);

  // Sync markers
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'owner', editorMarkers);
      }
    }
  }, [editorMarkers]);

  // Jump to line when active step is selected
  useEffect(() => {
    if (editorRef.current && monacoRef.current && activeStepLine) {
      editorRef.current.revealLineInCenter(activeStepLine);
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new monacoRef.current.Range(activeStepLine, 1, activeStepLine, 1),
            options: {
              isWholeLine: true,
              className: 'monaco-active-step-line',
            },
          },
        ]
      );
    } else if (editorRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeStepLine]);

  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'python';

  return (
    <div className="w-full h-full bg-white dark:bg-ide-editor overflow-hidden">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={sourceCode}
        theme={theme === 'dark' ? 'mentor-zinc-dark' : 'mentor-zinc-light'}
        onChange={(val) => setSourceCode(val || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: editorSettings.fontSize || 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          minimap: { enabled: editorSettings.minimap },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          tabSize: editorSettings.tabSize || 4,
          wordWrap: editorSettings.wordWrap || 'on',
          folding: true,
        }}
      />
    </div>
  );
}
