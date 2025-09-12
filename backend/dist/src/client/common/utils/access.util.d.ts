export type CompanyGrade = 'free' | 'standard' | 'business';
export declare function gradeToLevel(g: CompanyGrade): 1 | 2 | 0;
export declare function canUseTrack(companyGrade: CompanyGrade, trackGradeRequired: 0 | 1 | 2): boolean;
