import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DebuggerProvider } from './contexts/DebuggerContext';
import { AppHeader } from './components/app/AppHeader';
import { AppSidebar } from './components/app/AppSidebar';
import { StatusBar } from './components/app/StatusBar';
import { AppRoutes } from './routes/AppRoutes';

function ShellLayout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-ide-bg text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans select-none relative">
      {/* Subtle Watermark Layer */}
      <div className="pointer-events-none fixed inset-0 z-0 watermark-background opacity-[0.035] dark:opacity-[0.045]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col h-full w-full overflow-hidden">
        <AppHeader />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {user && <AppSidebar />}
          <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto bg-zinc-50/70 dark:bg-ide-bg/80">
            <AppRoutes />
          </main>
        </div>
        {user && <StatusBar />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DebuggerProvider>
            <ShellLayout />
          </DebuggerProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
