import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DatasetManagementPage } from './pages/DatasetManagementPage';
import { DataPreviewPage } from './pages/DataPreviewPage';
import { ProcessingMonitorPage } from './pages/ProcessingMonitorPage';
import { DateValidationPage } from './pages/DateValidationPage';
import { AnomalyReportPage } from './pages/AnomalyReportPage';
import { RecordTimelinePage } from './pages/RecordTimelinePage';
import { RuleManagementPage } from './pages/RuleManagementPage';
import { DatasetOnboardingPage } from './pages/DatasetOnboardingPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { authService } from './services/api';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(authService.getStoredUser());

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans">
        <Navbar
          userRole={currentUser.role}
          username={currentUser.username}
          onLogout={handleLogout}
        />

        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/datasets" element={<DatasetManagementPage />} />
              <Route path="/preview" element={<DataPreviewPage />} />
              <Route path="/monitor" element={<ProcessingMonitorPage />} />
              <Route path="/validation" element={<DateValidationPage />} />
              <Route path="/anomalies" element={<AnomalyReportPage />} />
              <Route path="/timeline" element={<RecordTimelinePage />} />
              <Route path="/rules" element={<RuleManagementPage />} />
              <Route path="/onboarding" element={<DatasetOnboardingPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
