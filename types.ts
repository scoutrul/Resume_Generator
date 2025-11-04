export interface GenerationOutput {
  resume: string;
  coverLetter: string;
}

export type ProfileInputMode = 'visual' | 'json';
export type CoverLetterLength = 'short' | 'medium' | 'long';

// Fix: Add missing QuickStartData interface export.
export interface QuickStartData {
  role: string;
  skills: string;
  experience: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  keywords?: string;
}

export interface Experience {
  company: string;
  location:string;
  title: string;
  period: string;
  responsibilities: string[];
  technologies: string[];
}

export interface HardSkill {
  name: string;
  level: string;
}

// Fix: Define and export the SoftSkill interface.
export interface SoftSkill {
  name: string;
  level: string;
}

export interface Skills {
  hardSkills: { [category: string]: HardSkill[] };
  // Fix: Update softSkills to be an array of SoftSkill objects.
  softSkills: SoftSkill[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface Education {
  degree: string;
  university: string;
  period: string;
}

export interface CandidateProfile {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  education: Education;
  philosophy: string;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: string;
  vacancyText: string;
  candidateProfile: CandidateProfile;
  output: GenerationOutput;
}

export interface Preset {
  name: string;
  profile: string; // JSON string of CandidateProfile
  vacancy: string; // The text of the vacancy
}
