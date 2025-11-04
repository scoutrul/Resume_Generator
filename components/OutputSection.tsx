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

const handleSaveAsPdf = (htmlContent: string, documentTitle: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Пожалуйста, разрешите всплывающие окна для этой страницы, чтобы сохранить PDF.');
        return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>${documentTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;700&display=swap');
            
            body {
              font-family: 'PT Serif', Georgia, serif;
              line-height: 1.5;
              color: #333;
              background-color: #fff;
              margin: 0;
            }

            @page {
              size: A4;
              margin: 2cm;
            }
            
            .page-container {
              width: 210mm;
              min-height: 297mm;
              padding: 2cm;
              box-sizing: border-box;
            }
            
            h1, h2, h3, h4, h5, h6 {
              font-family: 'Roboto', sans-serif;
              font-weight: 700;
              color: #000;
              margin-top: 1.2em;
              margin-bottom: 0.6em;
              line-height: 1.2;
            }

            h1 { font-size: 22pt; }
            h2 { font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            h3 { font-size: 12pt; text-transform: uppercase; letter-spacing: 0.5px; }
            
            p, li { 
              font-size: 10pt; 
              text-align: justify;
            }

            ul {
              padding-left: 20px;
              list-style-type: disc;
            }
            
            strong {
              font-weight: 700;
            }

            em {
              font-style: italic;
            }

            @media print {
              body { margin: 0; }
              .page-container { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="page-container">${htmlContent}</div>
          <script type="text/javascript">
            setTimeout(function() {
              window.print();
              window.close();
            }, 250);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
};


const OutputDisplay: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="prose prose-invert prose-sm md:prose-base max-w-none p-4 h-full overflow-y-auto bg-slate-800 rounded-b-md"
            dangerouslySetInnerHTML={{ __html: content }}
        >
        </div>
    );
};

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean;}> = ({ onClick, children, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="px-3 py-1 text-xs font-semibold bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

export const OutputSection: React.FC<OutputSectionProps> = ({ output, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');
  const [resumeCopied, setResumeCopied] = useState(false);
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);

  const handleCopy = (text: string, type: 'resume' | 'coverLetter') => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      if (type === 'resume') {
          setResumeCopied(true);
          setTimeout(() => setResumeCopied(false), 2000);
      } else {
          setCoverLetterCopied(true);
          setTimeout(() => setCoverLetterCopied(false), 2000);
      }
  };

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

    const currentContent = activeTab === 'resume' ? output.resume : output.coverLetter;
    const currentHtmlContent = simpleMarkdownToHtml(currentContent);
    const documentTitle = activeTab === 'resume' ? 'Резюме' : 'Сопроводительное письмо';

    return (
      <>
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center border-b border-slate-700 pr-2">
                <div className="flex">
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
                <div className="flex items-center space-x-2">
                    <ActionButton onClick={() => handleSaveAsPdf(currentHtmlContent, documentTitle)}>
                        Сохранить как PDF
                    </ActionButton>
                </div>
            </div>
            <div className="flex-grow min-h-0 relative">
                {activeTab === 'resume' && <OutputDisplay content={simpleMarkdownToHtml(output.resume)} />}
                {activeTab === 'coverLetter' && <OutputDisplay content={simpleMarkdownToHtml(output.coverLetter)} />}

                 <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
                    {activeTab === 'resume' && (
                        <>
                            {resumeCopied && <span className="text-xs text-sky-400">Скопировано!</span>}
                            <button 
                                onClick={() => handleCopy(output.resume, 'resume')} 
                                title="Копировать резюме" 
                                className="p-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={resumeCopied}
                            >
                                <ClipboardIcon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {activeTab === 'coverLetter' && (
                         <>
                            {coverLetterCopied && <span className="text-xs text-sky-400">Скопировано!</span>}
                            <button 
                                onClick={() => handleCopy(output.coverLetter, 'coverLetter')} 
                                title="Копировать письмо" 
                                className="p-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={coverLetterCopied}
                            >
                                <ClipboardIcon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      </>
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
