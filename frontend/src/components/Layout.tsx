import React from 'react';  
import type { ReactNode } from 'react';

interface MainLayoutProps {
  title: string;
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-indigo-400">{title}</h1>
        {children}
      </div>
    </div>
  );
};
