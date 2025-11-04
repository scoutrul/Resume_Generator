import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { HistorySidebar } from './components/HistorySidebar';
import { generateResumeAndCoverLetter } from './services/geminiService';
import { PRESETS } from './constants';
import { GenerationOutput, CandidateProfile, ProfileInputMode, CoverLetterLength, GenerationHistoryItem } from './types';

const App: React.FC = () => {
  const [vacancyText, setVacancyText] = useState<string>('');
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(() => {
    try {
      const savedProfile = localStorage.getItem('candidateProfile');
      return savedProfile ? JSON.parse(savedProfile) : JSON.parse(PRESETS[0].profile);
    } catch (error) {
      console.error("Failed to parse profile from localStorage or mock", error);
      return JSON.parse(PRESETS[0].profile);
    }
  });
  
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('generationHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      return [];
    }
  });

  const [profileInputMode, setProfileInputMode] = useState<ProfileInputMode>('visual');
  const [coverLetterLength, setCoverLetterLength] = useState<CoverLetterLength>('medium');
  const [output, setOutput] = useState<GenerationOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem('candidateProfile', JSON.stringify(candidateProfile));
      } catch (error) {
        console.error("Failed to save profile to localStorage", error);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [candidateProfile]);
  
  useEffect(() => {
    try {
      localStorage.setItem('generationHistory', JSON.stringify(generationHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [generationHistory]);

  const handleGenerate = useCallback(async () => {
    if (!vacancyText.trim()) {
      setError('Пожалуйста, вставьте описание вакансии для генерации документов.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const profileString = JSON.stringify(candidateProfile, null, 2);
      const result = await generateResumeAndCoverLetter(vacancyText, profileString, coverLetterLength);
      setOutput(result);
      
      const newHistoryItem: GenerationHistoryItem = {
        id: new Date().toISOString() + Math.random(), // Add random number for better uniqueness
        timestamp: new Date().toISOString(),
        vacancyText,
        candidateProfile,
        output: result,
      };
      setGenerationHistory(prevHistory => [newHistoryItem, ...prevHistory]);

    } catch (err) {
      console.error('Generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка.';
      setError(`Не удалось сгенерировать контент. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [vacancyText, candidateProfile, coverLetterLength]);

  const handleRevisitHistory = (id: string) => {
    const item = generationHistory.find(h => h.id === id);
    if (item) {
      setVacancyText(item.vacancyText);
      setCandidateProfile(item.candidateProfile);
      setOutput(item.output);
      setError(null);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setGenerationHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('Вы уверены, что хотите полностью очистить историю генераций? Это действие необратимо.')) {
      setGenerationHistory([]);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Header />
      <div className="flex-grow flex w-full max-w-[1920px] mx-auto">
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <div className={`grid grid-cols-1 ${output ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8 h-full`}>
            <div className={!output ? "lg:col-span-2" : ""}>
              <InputSection
                vacancyText={vacancyText}
                setVacancyText={setVacancyText}
                profileInputMode={profileInputMode}
                setProfileInputMode={setProfileInputMode}
                candidateProfile={candidateProfile}
                setCandidateProfile={setCandidateProfile}
                coverLetterLength={coverLetterLength}
                setCoverLetterLength={setCoverLetterLength}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </div>
            <OutputSection
              output={output}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </main>
        <HistorySidebar
          history={generationHistory}
          onRevisit={handleRevisitHistory}
          onDelete={handleDeleteHistoryItem}
          onClearAll={handleClearHistory}
        />
      </div>
    </div>
  );
};

export default App;