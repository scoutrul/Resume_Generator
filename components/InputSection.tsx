import React from 'react';
import { ProfileInputMode, CandidateProfile, CoverLetterLength } from '../types';
import { VisualProfileBuilder } from './profile/VisualProfileBuilder';
import { JsonEditor } from './profile/JsonEditor';
import { PRESETS } from '../constants';
import { BadgeCheckIcon } from './icons/BadgeCheckIcon';
import { CircleDotIcon } from './icons/CircleDotIcon';

interface InputSectionProps {
  vacancyText: string;
  setVacancyText: (value: string) => void;
  profileInputMode: ProfileInputMode;
  setProfileInputMode: (mode: ProfileInputMode) => void;
  candidateProfile: CandidateProfile;
  setCandidateProfile: (profile: CandidateProfile) => void;
  coverLetterLength: CoverLetterLength;
  setCoverLetterLength: (length: CoverLetterLength) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-t-md focus:outline-none transition-colors duration-200 ${
      isActive
        ? 'bg-slate-800 text-sky-400'
        : 'bg-slate-900 text-slate-400 hover:bg-slate-800/50'
    }`}
  >
    {label}
  </button>
);

export const InputSection: React.FC<InputSectionProps> = ({
  vacancyText,
  setVacancyText,
  profileInputMode,
  setProfileInputMode,
  candidateProfile,
  setCandidateProfile,
  coverLetterLength,
  setCoverLetterLength,
  onGenerate,
  isLoading,
}) => {
  const canGenerate = vacancyText.trim();

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = PRESETS.find(p => p.name === e.target.value);
    if (selectedPreset) {
      setVacancyText(selectedPreset.vacancy);
      try {
        const profileData = JSON.parse(selectedPreset.profile);
        setCandidateProfile(profileData);
      } catch (err) {
        console.error("Failed to parse preset profile", err);
      }
    }
  };

  const isVacancyComplete = vacancyText.trim().length > 0;
  const isProfileComplete = 
    !!candidateProfile &&
    !!candidateProfile.personalInfo?.name?.trim() &&
    !!candidateProfile.summary?.trim() &&
    Array.isArray(candidateProfile.experience) &&
    candidateProfile.experience.length > 0;


  return (
    <div className="flex flex-col space-y-6 h-full">
        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-md border border-slate-700">
            <label htmlFor="preset-selector" className="font-semibold text-slate-300">
                Быстрый старт (выбрать пример)
            </label>
            <select
                id="preset-selector"
                onChange={handlePresetChange}
                defaultValue=""
                className="bg-slate-700 border border-slate-600 rounded-md text-sm p-2 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-colors"
            >
                <option value="" disabled>Выбрать роль...</option>
                {PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
        </div>

      <div className="flex flex-col flex-grow min-h-[250px]">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="vacancy" className="font-semibold text-slate-300 flex items-center gap-2">
              {isVacancyComplete 
                ? <BadgeCheckIcon className="w-5 h-5 text-green-400"><title>Заполнено</title></BadgeCheckIcon>
                : <CircleDotIcon className="w-5 h-5 text-slate-500"><title>Не заполнено</title></CircleDotIcon>}
              <span>1. Вставьте описание вакансии</span>
            </label>
        </div>
        <textarea
          id="vacancy"
          value={vacancyText}
          onChange={(e) => setVacancyText(e.target.value)}
          placeholder="Вставьте сюда полное описание вакансии..."
          className="w-full flex-grow p-3 bg-slate-800 border border-slate-700 rounded-md resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow duration-200"
        />
      </div>

      <div className="flex flex-col flex-grow min-h-[350px]">
        <div className="mb-2 flex items-center justify-between">
           <h2 className="font-semibold text-slate-300 flex items-center gap-2">
            {isProfileComplete 
                ? <BadgeCheckIcon className="w-5 h-5 text-green-400"><title>Заполнено</title></BadgeCheckIcon>
                : <CircleDotIcon className="w-5 h-5 text-slate-500"><title>Не заполнено</title></CircleDotIcon>}
            <span>2. Укажите данные кандидата</span>
           </h2>
        </div>
        <div className="flex border-b border-slate-700">
            <TabButton label="Визуальный редактор" isActive={profileInputMode === 'visual'} onClick={() => setProfileInputMode('visual')} />
            <TabButton label="JSON редактор" isActive={profileInputMode === 'json'} onClick={() => setProfileInputMode('json')} />
        </div>
        <div className="flex-grow bg-slate-800 rounded-b-md p-4 border border-t-0 border-slate-700 min-h-0 overflow-y-auto">
            {profileInputMode === 'visual' && <VisualProfileBuilder profile={candidateProfile} setProfile={setCandidateProfile} />}
            {profileInputMode === 'json' && <JsonEditor profile={candidateProfile} setProfile={setCandidateProfile} />}
        </div>
      </div>

      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between gap-4">
            <label htmlFor="cover-letter-length" className="font-medium text-slate-300 whitespace-nowrap">
                Длина сопроводительного письма
            </label>
            <select
                id="cover-letter-length"
                value={coverLetterLength}
                onChange={(e) => setCoverLetterLength(e.target.value as CoverLetterLength)}
                className="bg-slate-700 border border-slate-600 rounded-md text-sm p-2 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-colors w-full max-w-xs"
            >
                <option value="short">Короткое (≈2-3 абзаца)</option>
                <option value="medium">Среднее (≈3-4 абзаца)</option>
                <option value="long">Длинное (≈4-5 абзацев)</option>
            </select>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading || !canGenerate}
          className="w-full flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-sky-600 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-sky-900/50 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Генерация...
            </>
          ) : (
            'Сгенерировать документы'
          )}
        </button>
      </div>
    </div>
  );
};