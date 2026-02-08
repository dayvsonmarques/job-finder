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
