import type { ExploreSectionsDto } from './dto/explore.dto';
type Grade = 'free' | 'standard' | 'business';
export declare class ExploreService {
    private readonly db;
    constructor(db: any);
    getSections(companyId: number, grade: Grade, isAuth: boolean): Promise<ExploreSectionsDto>;
}
export {};
