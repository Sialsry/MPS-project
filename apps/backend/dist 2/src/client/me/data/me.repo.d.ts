import type { Pool } from 'pg';
export declare class MeRepo {
    private readonly pool;
    constructor(pool: Pool);
    getMonthLabel(): Promise<any>;
    listCompanyMusics(companyId: number, musicId?: number): Promise<any>;
    getMonthlyPlan(musicId: number): Promise<any>;
    getAggregates(companyId: number, musicId: number): Promise<any>;
    getDaily(companyId: number, musicId: number, days: number): Promise<any>;
    countPlays(companyId: number, musicId: number): Promise<number>;
    listPlays(companyId: number, musicId: number, limit: number, offset: number): Promise<any>;
}
