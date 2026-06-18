/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './lib/AuthContext.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FacultyDashboard } from './components/FacultyDashboard.tsx';
import { AuthView } from './components/AuthView.tsx';

function MainApp() {
  const { user, dbUser, role, loading, logOut } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-500">
        <div className="animate-pulse flex items-center space-x-2 text-lg">
          <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
          <div>Loading workspace...</div>
        </div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              SH
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Smart Student Hub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">
               {dbUser.name} <span className="opacity-50">({role})</span>
            </span>
            <button
              onClick={logOut}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'FACULTY' ? <FacultyDashboard /> : <Dashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
