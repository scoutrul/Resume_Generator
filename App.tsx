import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateResumeAndCoverLetter } from './services/geminiService';
import { DEFAULT_CANDIDATE_PROFILE } from './constants';
import { GenerationOutput, CandidateProfile, ProfileInputMode } from './types';

const App: React.FC = () => {
  const [vacancyText, setVacancyText] = useState<string>('');
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(() => {
    try {
      const savedProfile = localStorage.getItem('candidateProfile');
      return savedProfile ? JSON.parse(savedProfile) : JSON.parse(DEFAULT_CANDIDATE_PROFILE);
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
      return JSON.parse(DEFAULT_CANDIDATE_PROFILE);
    }
  });

  const [profileInputMode, setProfileInputMode] = useState<ProfileInputMode>('visual');
  const [output, setOutput] = useState<GenerationOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      const result = await generateResumeAndCoverLetter(vacancyText, profileString);
      setOutput(result);
    } catch (err) {
      console.error('Generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка.';
      setError(`Не удалось сгенерировать контент. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [vacancyText, candidateProfile]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className={`grid grid-cols-1 ${output ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8 h-full max-w-screen-2xl mx-auto`}>
          <div className={!output ? "lg:col-span-2" : ""}>
            <InputSection
              vacancyText={vacancyText}
              setVacancyText={setVacancyText}
              profileInputMode={profileInputMode}
              setProfileInputMode={setProfileInputMode}
              candidateProfile={candidateProfile}
              setCandidateProfile={setCandidateProfile}
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
    </div>
  );
};

export default App;