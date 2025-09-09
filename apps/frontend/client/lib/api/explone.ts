// lib/api/explone.ts
import { api } from './core/http';

export type AccessReason = 'OK' | 'LOGIN_REQUIRED' | 'SUBSCRIPTION_REQUIRED';

export type RewardInfo = {
  reward_one: string | null;
  reward_total: string | null;
  reward_remain: string | null;
  total_count: number | null;
  remain_count: number | null;
};

export type ExploreTrack = {
  id: number;
  title: string;
  artist: string;
  cover_image_url?: string | null;
  format: 'FULL' | 'INSTRUMENTAL';
  has_lyrics: boolean;
  grade_required: 0 | 1 | 2;
  can_use: boolean;
  reward: RewardInfo;
  popularity: number;
  created_at: string;
  access?: {
    is_guest: boolean;
    requires_login: boolean;
    can_use: boolean;
    reason: AccessReason;
  };
};

export type ExploreSection = { key: string; title: string; items: ExploreTrack[] };

export type ExploreSections = {
  featured: ExploreTrack[];
  news: ExploreSection;
  charts: ExploreSection;
  moods: ExploreSection;
};

export const getExploreSections = () =>
  api('/explore/sections') as Promise<ExploreSections>;
