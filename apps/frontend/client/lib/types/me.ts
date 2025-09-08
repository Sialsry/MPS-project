// lib/types/me.ts
export type MeOverviewApi = {
  company: {
    id: number;
    name: string;
    grade: "free" | "standard" | "business";
    profile_image_url: string | null;
    smart_account_address: string | null;
    total_rewards_earned: number;
    total_rewards_used: number;
    reward_balance: number;
  } | null;
  subscription: {
    plan: "free" | "standard" | "business";
    status: "active" | "none";
    start_date?: string | null;
    end_date?: string | null;
    next_billing_at?: string | null;
    remaining_days: number | null;
  };
  api_key: { last4: string | null } | null;
  using_summary: { using_count: number } | null;
  using_list: any[];
};

export type MeOverview = {
  company: {
    id: number;
    name: string;
    grade: "free" | "standard" | "business";
    profileImageUrl: string | null;
    smartAccountAddress: string | null;
    totalRewardsEarned: number;
    totalRewardsUsed: number;
    rewardBalance: number;
    ceoName?: string | null;
    phone?: string | null;
    homepageUrl?: string | null;
  } | null;
  subscription: {
    plan: "free" | "standard" | "business";
    status: "active" | "none";
    remainingDays: number | null;
  };
  apiKey: { last4: string | null };
  usingSummary: { usingCount: number };
  usingList: any[];
};


