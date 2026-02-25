// JobAI Scout - Type Definitions

export interface AITool {
  id: string;
  slug: string;
  name: string;
  chineseName: string;
  tagline: string;
  description: string;
  website: string;
  logoUrl: string;
  category: 'resume' | 'interview' | 'career' | 'skill' | 'matching';
  status: 'draft' | 'published' | 'archived';
  content: ToolContent;
  rating: number;
  viewCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  source: 'producthunt' | 'github' | 'twitter' | 'manual';
  sourceUrl?: string;
}

export interface ToolContent {
  founderBackground: string;
  problemSolved: string[];
  userValue: UserValueItem[];
  targetUsers: string;
  howToUse: string[];
  useCases: UseCase[];
  pricing: Pricing;
  pros: string[];
  cons: string[];
}

export interface UserValueItem {
  feature: string;
  desc: string;
}

export interface UseCase {
  scenario: string;
  before: string;
  after: string;
}

export interface Pricing {
  free: string;
  pro: string;
  premium: string;
}

export interface DailyPost {
  id: string;
  postDate: string;
  toolIds: string[];
  status: 'scheduled' | 'published';
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  webhookUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor';
}

export type ToolCategory = 'all' | 'resume' | 'interview' | 'career' | 'skill' | 'matching';

export type SortOption = 'newest' | 'popular' | 'rating';

export interface FilterState {
  category: ToolCategory;
  sort: SortOption;
  search: string;
}
