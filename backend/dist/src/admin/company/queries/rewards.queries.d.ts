export declare const buildSummaryQuery: (companyId: number, ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildDailyQuery: (companyId: number, ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildDailyIndustryAvgQuery: (ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildByMusicQuery: (companyId: number, ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildMonthlyCompanyQuery: (companyId: number, ymYear: number, ymMonth: number, months: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildMonthlyIndustryAvgQuery: (ymYear: number, ymMonth: number, months: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildSummaryListBaseQuery: (ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
