export declare const isValidYearMonth: (s?: string) => boolean;
export declare const getDefaultYearMonthKST: () => string;
export declare const resolveYearMonthKST: (ym?: string) => string;
export declare const getPrevYearMonthKST: (ym?: string) => string;
export declare const resolveYMToYearMonth: (ym?: string) => {
    year: number;
    month: number;
};
export declare const isCurrentYM: (ym: string) => boolean;
export declare const getMonthStartEndSqlKST: (y: number, m: number) => {
    start: string;
    end: string;
};
export declare const getMonthRangeSqlKST: (y: number, m: number) => {
    start: import("drizzle-orm").SQL<unknown>;
    end: import("drizzle-orm").SQL<unknown>;
};
export declare const buildMonthRangeCTE: (y: number, m: number) => import("drizzle-orm").SQL<unknown>;
export declare const getDayRangeSqlKST: (y: number, m: number, d: number) => {
    start: import("drizzle-orm").SQL<unknown>;
    end: import("drizzle-orm").SQL<unknown>;
};
export declare const buildDayRangeCTE: (y: number, m: number, d: number) => import("drizzle-orm").SQL<unknown>;
