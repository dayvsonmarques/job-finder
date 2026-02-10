export type JobFilter = "all" | "favorite" | "submitted";

export interface Job {
  id: string;
  externalId: string | null;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  salary: string | null;
  tags: string | null;
  aiSummary: string | null;
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isSubmitted: boolean;
  favoritedAt: string | null;
  submittedAt: string | null;
}

export interface SearchConfig {
  id: string;
  keywords: string;
  location: string;
  intervalHours: number;
  enabledSources: string;
  lastSearchAt: string | null;
  isActive: boolean;
}

export interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  salary?: string;
  tags?: string;
  postedAt?: Date;
  externalId?: string;
}

export type CourseLevel = "pos-graduacao" | "mestrado" | "doutorado";
export type CourseModality = "presencial" | "ead" | "hibrido";
export type CourseShift = "matutino" | "vespertino" | "noturno" | "flexivel";

export interface Course {
  id: string;
  institution: string;
  program: string;
  level: CourseLevel;
  modality: CourseModality;
  shift: CourseShift;
  area: string;
  city: string;
  state: string;
  duration: string;
  url: string;
  mecRecognized: boolean;
  mecGrade: number | null;
  price: string | null;
  description: string;
  tags: string[];
}

export type CourseModalityFilter = "all" | CourseModality;
export type CourseLevelFilter = "all" | CourseLevel;
