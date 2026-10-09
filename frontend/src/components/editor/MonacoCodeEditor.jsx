import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useDebugger } from '../../contexts/DebuggerContext';

export function MonacoCodeEditor() {
  const {
    language,
    sourceCode,
    setSourceCode,
    editorMarkers,
    activeStepLine,
  } = useDebugger();

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom dark theme
    monaco.editor.defineTheme('mentor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '60a5fa', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#60a5fa',
        'editor.selectionBackground': '#1e3a8a50',
        'editor.lineHighlightBackground': '#1e293b60',
        'editorCursor.foreground': '#38bdf8',
        'editorWhitespace.foreground': '#334155',
      },
    });

    monaco.editor.setTheme('mentor-dark');
  };

  // Sync Markers (Squiggles & Hover Tooltips)
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'owner', editorMarkers);
      }
    }
  }, [editorMarkers]);

  // Jump to active line when user clicks step guidance
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
              className: 'bg-blue-500/20 border-l-4 border-blue-500',
              glyphMarginClassName: 'text-blue-400 font-bold',
            },
          },
        ]
      );
    } else if (editorRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeStepLine]);

  // Language mapping for Monaco
  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'python';

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-b-2xl overflow-hidden border border-t-0 border-slate-800 bg-[#0f172a]">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={sourceCode}
        theme="mentor-dark"
        onChange={(val) => setSourceCode(val || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          tabSize: 4,
          wordWrap: 'on',
          folding: true,
        }}
      />
    </div>
  );
}
