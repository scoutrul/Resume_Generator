import React, { useState, ReactNode, useMemo } from 'react';
import { CandidateProfile, Experience, HardSkill, Project, Education, SoftSkill } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface VisualProfileBuilderProps {
  profile: CandidateProfile;
  // Fix: Corrected the typo from Candidate-Profile to CandidateProfile.
  setProfile: (profile: CandidateProfile) => void;
}

const Section: React.FC<{ title: string; children: ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700 last:border-b-0 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
        <h3 className="text-lg font-semibold text-slate-300 flex justify-between items-center">
          {title}
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </h3>
      </button>
      {isOpen && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
};

const Input: React.FC<React.ComponentProps<'input'>> = (props) => (
  <input {...props} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow duration-200" />
);

const Textarea: React.FC<React.ComponentProps<'textarea'>> = (props) => (
  <textarea {...props} rows={4} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow duration-200" />
);

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div><label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>{children}</div>
);

const LEVEL_ORDER: { [key: string]: number } = {
    'Эксперт': 1,
    'Продвинутый': 2,
    'Средний': 3,
};

export const VisualProfileBuilder: React.FC<VisualProfileBuilderProps> = ({ profile, setProfile }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, personalInfo: { ...profile.personalInfo, [e.target.name]: e.target.value } });
  };
  
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, education: { ...profile.education, [e.target.name]: e.target.value } });
  };

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleNestedChange = <T,>(section: keyof CandidateProfile, index: number, field: keyof T, value: string) => {
    const sectionData = profile[section] as T[];
    const updatedItems = sectionData.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setProfile({ ...profile, [section]: updatedItems });
  };

  const handleListChange = (section: 'experience' | 'projects', itemIndex: number, field: 'responsibilities' | 'technologies', value: string) => {
    const listValue = field === 'technologies' 
        ? value.split(',').map(s => s.trim()) 
        : value.split('\n');

    const sectionData = profile[section] as any[];
    const updatedItems = sectionData.map((item, i) => {
        if (i === itemIndex) {
            return {...item, [field]: listValue};
        }
        return item;
    });
    setProfile({...profile, [section]: updatedItems});
  };

  const handleAddItem = <T,>(section: keyof CandidateProfile, newItem: T) => {
    const sectionData = profile[section] as T[];
    setProfile({ ...profile, [section]: [...sectionData, newItem] });
  };

  const handleRemoveItem = (section: keyof CandidateProfile, index: number) => {
    const sectionData = profile[section] as any[];
    setProfile({ ...profile, [section]: sectionData.filter((_, i) => i !== index) });
  };
  
  const handleAddSoftSkill = () => {
    // Fix: Defensively check if softSkills is an array to prevent crashes.
    const oldSkills = profile.skills || { hardSkills: {}, softSkills: [] };
    const currentSoftSkills = Array.isArray(oldSkills.softSkills) ? oldSkills.softSkills : [];
    const newSoftSkills = [...currentSoftSkills, { name: '', level: '' }];
    setProfile({ ...profile, skills: { ...oldSkills, softSkills: newSoftSkills } });
  };
  
  const handleRemoveSoftSkill = (index: number) => {
      // Fix: Defensively check if softSkills is an array to prevent crashes.
      if (!profile.skills || !Array.isArray(profile.skills.softSkills)) return;
      const newSkills = profile.skills.softSkills.filter((_, i) => i !== index);
      setProfile({ ...profile, skills: { ...profile.skills, softSkills: newSkills } });
  };
  
  const handleSoftSkillChange = (index: number, field: keyof SoftSkill, value: string) => {
      // Fix: Defensively check if softSkills is an array to prevent crashes.
      if (!profile.skills || !Array.isArray(profile.skills.softSkills)) return;
      const newSkills = profile.skills.softSkills.map((skill, i) => i === index ? { ...skill, [field]: value } : skill);
      setProfile({ ...profile, skills: { ...profile.skills, softSkills: newSkills } });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !profile.skills.hardSkills[newCategory.trim()]) {
      const newHardSkills = { ...profile.skills.hardSkills, [newCategory.trim()]: [] };
      setProfile({ ...profile, skills: { ...profile.skills, hardSkills: newHardSkills } });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    const { [category]: _, ...remainingSkills } = profile.skills.hardSkills;
    setProfile({ ...profile, skills: { ...profile.skills, hardSkills: remainingSkills } });
  };
  
  const handleRenameCategory = (oldName: string, newName: string) => {
    if (!newName || newName === oldName || profile.skills.hardSkills[newName]) {
        setEditingCategory(null);
        return;
    }
    const newHardSkills = Object.fromEntries(
        Object.entries(profile.skills.hardSkills).map(([key, value]) => key === oldName ? [newName, value] : [key, value])
    );
    setProfile({...profile, skills: {...profile.skills, hardSkills: newHardSkills}});
    setEditingCategory(null);
  };

  const handleAddSkillInCategory = (category: string) => {
    const newSkills = [...(profile.skills.hardSkills[category] || []), { name: '', level: '' }];
    setProfile({ ...profile, skills: { ...profile.skills, hardSkills: { ...profile.skills.hardSkills, [category]: newSkills } } });
  };

  const handleRemoveSkillInCategory = (category: string, skillIndex: number) => {
    const newSkills = profile.skills.hardSkills[category].filter((_, i) => i !== skillIndex);
    setProfile({ ...profile, skills: { ...profile.skills, hardSkills: { ...profile.skills.hardSkills, [category]: newSkills } } });
  };

  const handleSkillChangeInCategory = (category: string, skillIndex: number, field: keyof HardSkill, value: string) => {
    const newSkills = profile.skills.hardSkills[category].map((skill, i) => i === skillIndex ? { ...skill, [field]: value } : skill);
    setProfile({ ...profile, skills: { ...profile.skills, hardSkills: { ...profile.skills.hardSkills, [category]: newSkills } } });
  };
  
  const handleSortSkills = (category: string, type: 'name' | 'level') => {
    const skillsToSort = [...profile.skills.hardSkills[category]];

    if (type === 'name') {
        skillsToSort.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'level') {
        skillsToSort.sort((a, b) => {
            const levelA = LEVEL_ORDER[a.level] || 99;
            const levelB = LEVEL_ORDER[b.level] || 99;
            return levelA - levelB;
        });
    }

    const newHardSkills = {
        ...profile.skills.hardSkills,
        [category]: skillsToSort,
    };

    setProfile({
        ...profile,
        skills: {
            ...profile.skills,
            hardSkills: newHardSkills,
        },
    });
  };

  const allSkillNames = useMemo(() => {
    const names = new Set<string>();
    // Fix: Defensively iterate over hardSkills, checking if values are arrays.
    if (profile.skills?.hardSkills && typeof profile.skills.hardSkills === 'object') {
        Object.values(profile.skills.hardSkills).forEach(categorySkills => {
            if (Array.isArray(categorySkills)) {
                categorySkills.forEach(skill => {
                    if (skill?.name) names.add(skill.name);
                });
            }
        });
    }
    // Fix: Defensively check if softSkills is an array before iterating.
    if (Array.isArray(profile.skills?.softSkills)) {
      profile.skills.softSkills.forEach(skill => {
        if (skill?.name) names.add(skill.name);
      });
    }
    return Array.from(names);
  }, [profile.skills.hardSkills, profile.skills.softSkills]);
  
  return (
    <div className="text-sm">
      <datalist id="skills-list">
        {allSkillNames.map(name => <option key={name} value={name} />)}
      </datalist>

      <Section title="Личная информация" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormRow label="Полное имя"><Input name="name" value={profile.personalInfo.name} onChange={handlePersonalInfoChange} /></FormRow>
            <FormRow label="Должность"><Input name="title" value={profile.personalInfo.title} onChange={handlePersonalInfoChange} /></FormRow>
            <FormRow label="Email"><Input name="email" type="email" value={profile.personalInfo.email} onChange={handlePersonalInfoChange} /></FormRow>
            <FormRow label="Телефон"><Input name="phone" type="tel" value={profile.personalInfo.phone} onChange={handlePersonalInfoChange} /></FormRow>
            <FormRow label="LinkedIn"><Input name="linkedin" value={profile.personalInfo.linkedin} onChange={handlePersonalInfoChange} /></FormRow>
            <FormRow label="GitHub"><Input name="github" value={profile.personalInfo.github} onChange={handlePersonalInfoChange} /></FormRow>
            <FormRow label="Местоположение"><Input name="location" value={profile.personalInfo.location} onChange={handlePersonalInfoChange} /></FormRow>
            <FormRow label="Ключевые слова"><Input name="keywords" value={profile.personalInfo.keywords || ''} onChange={handlePersonalInfoChange} placeholder="Frontend, React, TypeScript..." list="skills-list"/></FormRow>
        </div>
      </Section>

      <Section title="Профессиональная сводка" defaultOpen={false}>
        <FormRow label="Краткое описание"><Textarea name="summary" value={profile.summary} onChange={handleSimpleChange} /></FormRow>
      </Section>
      
      <Section title="Опыт работы" defaultOpen={false}>
        {profile.experience.map((exp, index) => (
            <div key={index} className="p-3 bg-slate-700/50 rounded-md space-y-3 mb-3 relative">
                 <button onClick={() => handleRemoveItem('experience', index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormRow label="Должность"><Input value={exp.title} onChange={e => handleNestedChange<Experience>('experience', index, 'title', e.target.value)} /></FormRow>
                    <FormRow label="Компания"><Input value={exp.company} onChange={e => handleNestedChange<Experience>('experience', index, 'company', e.target.value)} /></FormRow>
                    <FormRow label="Местоположение"><Input value={exp.location} onChange={e => handleNestedChange<Experience>('experience', index, 'location', e.target.value)} /></FormRow>
                    <FormRow label="Период"><Input value={exp.period} onChange={e => handleNestedChange<Experience>('experience', index, 'period', e.target.value)} /></FormRow>
                </div>
                 <FormRow label="Обязанности (каждая с новой строки)"><Textarea value={exp.responsibilities.join('\n')} onChange={e => handleListChange('experience', index, 'responsibilities', e.target.value)} /></FormRow>
                 <FormRow label="Технологии (через запятую)"><Input value={exp.technologies.join(', ')} onChange={e => handleListChange('experience', index, 'technologies', e.target.value)} /></FormRow>
            </div>
        ))}
         <button onClick={() => handleAddItem<Experience>('experience', {company: '', location: '', title: '', period: '', responsibilities: [], technologies: []})} className="flex items-center space-x-2 text-sky-400 hover:text-sky-300 text-sm font-semibold"><PlusIcon className="w-4 h-4" /><span>Добавить опыт</span></button>
      </Section>

      <Section title="Навыки" defaultOpen={false}>
        <h4 className="font-semibold mb-2">Профессиональные навыки (Hard Skills)</h4>
        <p className="text-xs text-slate-400 mb-3">Подсказка: поля ввода навыков предлагают автодополнение на основе уже добавленных в профиль.</p>
        <div className="space-y-4">
          {/* Fix: Add checks for profile.skills and profile.skills.hardSkills to prevent crashes. */}
          {profile.skills?.hardSkills && Object.entries(profile.skills.hardSkills).map(([category, skills]) => (
            <div key={category} className="p-3 bg-slate-700/50 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-4">
                    {editingCategory?.oldName === category ? (
                      <Input 
                        value={editingCategory.newName}
                        onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                        onBlur={() => handleRenameCategory(editingCategory.oldName, editingCategory.newName)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameCategory(editingCategory.oldName, editingCategory.newName)}
                        autoFocus
                        className="text-base"
                      />
                    ) : (
                      <h5 className="font-semibold text-sky-400 cursor-pointer" onClick={() => setEditingCategory({ oldName: category, newName: category })}>{category}</h5>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleSortSkills(category, 'name')} title="Сортировать по имени (А-Я)" className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded">А-Я</button>
                    <button onClick={() => handleSortSkills(category, 'level')} title="Сортировать по уровню" className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded">Уровень</button>
                    <button onClick={() => handleRemoveCategory(category)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
              {/* Fix: Add check to ensure skills is an array before mapping. */}
              {Array.isArray(skills) && skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input placeholder="Навык (напр., React)" value={skill.name} onChange={e => handleSkillChangeInCategory(category, index, 'name', e.target.value)} list="skills-list" />
                  <Input placeholder="Уровень (напр., Эксперт)" value={skill.level} onChange={e => handleSkillChangeInCategory(category, index, 'level', e.target.value)} />
                  <button onClick={() => handleRemoveSkillInCategory(category, index)} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => handleAddSkillInCategory(category)} className="flex items-center space-x-2 text-sky-400 hover:text-sky-300 text-xs font-semibold mt-2"><PlusIcon className="w-3 h-3" /><span>Добавить навык в категорию</span></button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Input placeholder="Название новой категории" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <button onClick={handleAddCategory} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-white text-sm font-semibold whitespace-nowrap">Добавить категорию</button>
        </div>
        <hr className="border-slate-700 my-4" />
         <h4 className="font-semibold mb-2">Личностные качества (Soft Skills)</h4>
         <div className="space-y-2">
            {/* Fix: Defensively check if softSkills is an array before mapping. */}
            {Array.isArray(profile.skills?.softSkills) && profile.skills.softSkills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input placeholder="Навык (напр., Коммуникация)" value={skill.name} onChange={e => handleSoftSkillChange(index, 'name', e.target.value)} list="skills-list" />
                    <Input placeholder="Уровень (напр., Продвинутый)" value={skill.level} onChange={e => handleSoftSkillChange(index, 'level', e.target.value)} />
                    <button onClick={() => handleRemoveSoftSkill(index)} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                </div>
            ))}
         </div>
         <button onClick={handleAddSoftSkill} className="flex items-center space-x-2 text-sky-400 hover:text-sky-300 text-sm font-semibold mt-3"><PlusIcon className="w-4 h-4" /><span>Добавить качество</span></button>
      </Section>

      <Section title="Проекты" defaultOpen={false}>
        {profile.projects.map((project, index) => (
            <div key={index} className="p-3 bg-slate-700/50 rounded-md space-y-3 mb-3 relative">
                <button onClick={() => handleRemoveItem('projects', index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormRow label="Название проекта"><Input value={project.name} onChange={e => handleNestedChange<Project>('projects', index, 'name', e.target.value)} /></FormRow>
                    <FormRow label="Ссылка на проект"><Input value={project.link} onChange={e => handleNestedChange<Project>('projects', index, 'link', e.target.value)} /></FormRow>
                </div>
                <FormRow label="Описание"><Textarea value={project.description} onChange={e => handleNestedChange<Project>('projects', index, 'description', e.target.value)} /></FormRow>
                <FormRow label="Технологии (через запятую)"><Input value={project.technologies.join(', ')} onChange={e => handleListChange('projects', index, 'technologies', e.target.value)} /></FormRow>
            </div>
        ))}
        <button onClick={() => handleAddItem<Project>('projects', {name: '', description: '', technologies: [], link: ''})} className="flex items-center space-x-2 text-sky-400 hover:text-sky-300 text-sm font-semibold"><PlusIcon className="w-4 h-4" /><span>Добавить проект</span></button>
      </Section>

      <Section title="Образование" defaultOpen={false}>
        <div className="space-y-4">
            <FormRow label="Степень/Квалификация">
                <Input name="degree" value={profile.education.degree} onChange={handleEducationChange} placeholder="Например, Бакалавр наук, Компьютерные науки" />
            </FormRow>
            <FormRow label="Университет/Учебное заведение">
                <Input name="university" value={profile.education.university} onChange={handleEducationChange} placeholder="Например, Московский Технологический Университет" />
            </FormRow>
            <FormRow label="Период обучения">
                <Input name="period" value={profile.education.period} onChange={handleEducationChange} placeholder="Например, 2012 - 2016" />
            </FormRow>
        </div>
      </Section>

      <Section title="Философия работы" defaultOpen={false}>
        <FormRow label="Ваш подход к работе">
            <Textarea name="philosophy" value={profile.philosophy} onChange={handleSimpleChange} />
        </FormRow>
      </Section>
    </div>
  );
};