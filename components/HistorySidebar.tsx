import React, { useState } from 'react';
import { GenerationHistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface HistorySidebarProps {
  history: GenerationHistoryItem[];
  onRevisit: (id: string) => void;
  onDelete: (id:string) => void;
  onClearAll: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onRevisit, onDelete, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`relative flex-shrink-0 bg-slate-900/80 backdrop-blur-sm border-l border-slate-700/50 transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-16'}`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <HistoryIcon className="w-6 h-6 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100">История</h2>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full"
            title={isOpen ? "Свернуть" : "Развернуть"}
          >
            {isOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <>
            <div className="flex-grow p-2 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center text-slate-500 text-sm p-4">
                  <p>История генераций пуста.</p>
                  <p>Сохраненные результаты появятся здесь.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {history.map((item) => (
                    <li key={item.id} className="group relative bg-slate-800 rounded-md p-3 text-sm cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={() => onRevisit(item.id)}>
                      <p className="font-semibold text-slate-300 truncate">{item.vacancyText.split('\n')[0]}</p>
                      <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString('ru-RU')}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="absolute top-1 right-1 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Удалить"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {history.length > 0 && (
              <div className="p-4 border-t border-slate-700/50">
                <button
                  onClick={onClearAll}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-400 bg-red-900/30 rounded-md hover:bg-red-900/50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Очистить всю историю</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
