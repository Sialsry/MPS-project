export declare const buildRenewalStatsQuery: (ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildHourlyValidPlaysQuery: (y: number, m: number, d: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildTierDistributionQuery: (ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildRevenueCalendarQuery: (ymYear: number, ymMonth: number, tz: string) => import("drizzle-orm").SQL<unknown>;
export declare const buildRevenueTrendsQuery: (startYear: number, startMonth: number, months: number) => import("drizzle-orm").SQL<unknown>;
export declare const buildRevenueCompaniesQuery: (ymYear: number, ymMonth: number, tz: string, grade: string, limit: number) => import("drizzle-orm").SQL<unknown>;
export declare const buildRevenueCompaniesCumulativeQuery: (grade: string, limit: number) => import("drizzle-orm").SQL<unknown>;
