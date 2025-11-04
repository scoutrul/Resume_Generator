import React, { useState } from 'react';
import { GenerationOutput } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface OutputSectionProps {
  output: GenerationOutput | null;
  isLoading: boolean;
  error: string | null;
}

type ActiveTab = 'resume' | 'coverLetter';

const simpleMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return "";
    let inList = false;
    const lines = markdown.split('\n');
    const htmlLines: string[] = [];

    for (const line of lines) {
        let currentLine = line.trim();
        let htmlLine = "";

        // Determine if it's a list item
        const isListItem = currentLine.startsWith('- ') || currentLine.startsWith('* ');

        // Close list if current line is not a list item and we were in a list
        if (!isListItem && inList) {
            htmlLine += '</ul>';
            inList = false;
        }
        // Open list if current line is a list item and we were not in a list
        if (isListItem && !inList) {
            htmlLine += '<ul>';
            inList = true;
        }

        // Process line content
        if (currentLine.startsWith('### ')) {
            htmlLine += `<h3>${currentLine.substring(4)}</h3>`;
        } else if (currentLine.startsWith('## ')) {
            htmlLine += `<h2>${currentLine.substring(3)}</h2>`;
        } else if (currentLine.startsWith('# ')) {
            htmlLine += `<h1>${currentLine.substring(2)}</h1>`;
        } else if (isListItem) {
            htmlLine += `<li>${currentLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</li>`;
        } else if (currentLine) {
            htmlLine += `<p>${currentLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`;
        }
        
        htmlLines.push(htmlLine);
    }

    // Close any open list at the end
    if (inList) {
        htmlLines.push('</ul>');
    }

    return htmlLines.join('');
};


const OutputDisplay: React.FC<{ content: string; rawContent: string }> = ({ content, rawContent }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(rawContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative h-full">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-slate-700/50 rounded-md hover:bg-slate-600 transition-colors z-10"
                title="Скопировать Markdown в буфер обмена"
            >
                <ClipboardIcon className="w-5 h-5" />
            </button>
            {copied && <span className="absolute top-12 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">Скопировано!</span>}
            <div className="prose prose-invert prose-sm md:prose-base max-w-none p-4 h-full overflow-y-auto bg-slate-800 rounded-b-md"
                dangerouslySetInnerHTML={{ __html: content }}
            >
            </div>
        </div>
    );
};

export const OutputSection: React.FC<OutputSectionProps> = ({ output, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <LoadingSpinner className="w-12 h-12 mb-4" />
          <p className="text-lg font-semibold">Генерируем ваши документы...</p>
          <p className="text-sm">Это может занять некоторое время.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-400 p-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Произошла ошибка</h3>
            <p className="bg-red-900/50 p-3 rounded-md">{error}</p>
          </div>
        </div>
      );
    }

    if (!output) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500">
          <div className="text-center">
            <p className="text-lg font-medium">Ваши сгенерированные документы появятся здесь.</p>
            <p className="text-sm">Заполните данные и нажмите "Сгенерировать".</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex border-b border-slate-700">
          <TabButton
            label="Адаптированное резюме"
            isActive={activeTab === 'resume'}
            onClick={() => setActiveTab('resume')}
          />
          <TabButton
            label="Сопроводительное письмо"
            isActive={activeTab === 'coverLetter'}
            onClick={() => setActiveTab('coverLetter')}
          />
        </div>
        <div className="flex-grow min-h-0">
            {activeTab === 'resume' && <OutputDisplay content={simpleMarkdownToHtml(output.resume)} rawContent={output.resume} />}
            {activeTab === 'coverLetter' && <OutputDisplay content={simpleMarkdownToHtml(output.coverLetter)} rawContent={output.coverLetter} />}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-md h-full min-h-[600px] flex flex-col">
      {renderContent()}
    </div>
  );
};

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none ${
            isActive
            ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-800'
            : 'text-slate-400 hover:bg-slate-700/50'
        }`}
    >
        {label}
    </button>
)
