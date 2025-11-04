import React, { useState, useEffect } from 'react';
import { CandidateProfile } from '../../types';
// @ts-ignore
import Editor from 'react-simple-code-editor';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-json';


interface JsonEditorProps {
  profile: CandidateProfile;
  setProfile: (profile: CandidateProfile) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ profile, setProfile }) => {
  const [jsonString, setJsonString] = useState(() => JSON.stringify(profile, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update local state if the parent state changes (e.g., via visual editor)
    setJsonString(JSON.stringify(profile, null, 2));
    setError(null);
  }, [profile]);

  const handleValueChange = (code: string) => {
    setJsonString(code);
    try {
      const parsedProfile = JSON.parse(code);
      setProfile(parsedProfile);
      setError(null);
    } catch (err) {
      setError('Неверный формат JSON. Пожалуйста, исправьте ошибки.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="w-full flex-grow bg-slate-900 border border-slate-700 rounded-md font-mono text-sm focus-within:ring-2 focus-within:ring-sky-500 focus-within:outline-none transition-shadow duration-200 overflow-auto"
      >
        <Editor
          value={jsonString}
          onValueChange={handleValueChange}
          highlight={code => Prism.highlight(code, Prism.languages.json, 'json')}
          padding={12} // Corresponds to p-3
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            lineHeight: '1.5',
            caretColor: '#e2e8f0', // slate-200
          }}
          textareaClassName="focus:outline-none"
          preClassName="focus:outline-none"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{error}</p>
      )}
    </div>
  );
};