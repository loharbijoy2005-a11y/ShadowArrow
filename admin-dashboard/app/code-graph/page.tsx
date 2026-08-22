'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

export default function CodeGraphAdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has an active admin session
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ops_admin_token');
    localStorage.removeItem('admin_token');
    window.location.href = '/';
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ops-900 text-gray-400 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-sm font-medium">Validating admin session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f19] font-sans">
      {/* Sidebar Navigation */}
      <Navigation onLogout={handleLogout} />

      {/* Embedded Code Graph Visualizer */}
      <main className="flex-1 flex flex-col h-full bg-[#0b0f19] relative no-padding">
        <iframe
          src="/visualizer.html?v=7"
          className="w-full h-full border-none"
          title="Codebase Knowledge Graph"
        />
      </main>
    </div>
  );
}
