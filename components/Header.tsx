import React from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

export const Header: React.FC = () => {
  return (
    <header className="p-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto flex items-center space-x-3">
        <BrainCircuitIcon className="w-8 h-8 text-sky-400" />
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Генератор резюме на базе LLM
        </h1>
      </div>
    </header>
  );
};