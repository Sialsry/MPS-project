import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import type { DB } from '../../db/client';
import type { RewardsSummaryQueryDto } from './dto/rewards-summary.query.dto';
import { RevenueCalendarQueryDto, RevenueCalendarResponseDto } from './dto/revenue-calendar.dto';
import { RevenueTrendsQueryDto, RevenueTrendsResponseDto } from './dto/revenue-trends.dto';
import { RevenueCompaniesQueryDto, RevenueCompaniesResponseDto } from './dto/revenue-companies.dto';
import { CompanyTotalStatsQueryDto, CompanyTotalStatsResponseDto } from './dto/company-stats.dto';
import { RenewalStatsQueryDto, RenewalStatsResponseDto } from './dto/renewal-stats.dto';
import { HourlyPlaysQueryDto, HourlyPlaysResponseDto } from './dto/hourly-plays.dto';
import { TierDistributionQueryDto, TierDistributionResponseDto } from './dto/tier-distribution.dto';
export declare class CompanyService {
    private readonly db;
    constructor(db: DB);
    getRewardsSummary(params: RewardsSummaryQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: number;
        yearMonth: string;
    }>;
    getRewardsDetail(companyId: number, yearMonth?: string): Promise<{
        company: {
            id: number;
            name: string;
            tier: string;
            businessNumber?: undefined;
            contactEmail?: undefined;
            contactPhone?: undefined;
            homepageUrl?: undefined;
            profileImageUrl?: undefined;
            smartAccountAddress?: undefined;
            ceoName?: undefined;
            createdAt?: undefined;
            updatedAt?: undefined;
            subscriptionStart?: undefined;
            subscriptionEnd?: undefined;
        };
        summary: {
            totalTokens: number;
            monthlyEarned: number;
            monthlyUsed: number;
            usageRate: number;
            activeTracks: number;
            yearMonth: string;
            earnedTotal?: undefined;
            usedTotal?: undefined;
        };
        daily: never[];
        dailyIndustryAvg: never[];
        monthly: never[];
        monthlyIndustryAvg: never[];
        byMusic: never[];
    } | {
        company: {
            id: number;
            name: any;
            tier: string;
            businessNumber: any;
            contactEmail: any;
            contactPhone: any;
            homepageUrl: any;
            profileImageUrl: any;
            smartAccountAddress: any;
            ceoName: any;
            createdAt: string | undefined;
            updatedAt: string | undefined;
            subscriptionStart: string | undefined;
            subscriptionEnd: string | undefined;
        };
        summary: {
            totalTokens: number;
            monthlyEarned: number;
            monthlyUsed: number;
            usageRate: number;
            activeTracks: number;
            yearMonth: string;
            earnedTotal: number;
            usedTotal: number;
        };
        daily: any;
        dailyIndustryAvg: any;
        monthly: any;
        monthlyIndustryAvg: any;
        byMusic: any;
    }>;
    create(createCompanyDto: CreateCompanyDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateCompanyDto: UpdateCompanyDto): string;
    remove(id: number): string;
    getTotalCount(query: CompanyTotalStatsQueryDto): Promise<CompanyTotalStatsResponseDto>;
    getRenewalStats(query: RenewalStatsQueryDto): Promise<RenewalStatsResponseDto>;
    getHourlyValidPlays(query: HourlyPlaysQueryDto): Promise<HourlyPlaysResponseDto>;
    getTierDistribution(query: TierDistributionQueryDto): Promise<TierDistributionResponseDto>;
    getRevenueCalendar(query: RevenueCalendarQueryDto): Promise<RevenueCalendarResponseDto>;
    getRevenueTrends(query: RevenueTrendsQueryDto): Promise<RevenueTrendsResponseDto>;
    getRevenueCompanies(query: RevenueCompaniesQueryDto): Promise<RevenueCompaniesResponseDto>;
}
