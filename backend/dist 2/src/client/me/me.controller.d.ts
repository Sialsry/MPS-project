import { MeService } from './me.service';
import { UpdateProfileDto } from './dto/update-me.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { GetMeRewardsQueryDto } from './dto/me-rewards.dto';
import { GetMePlaysQueryDto, MePlaysResponseDto } from './dto/me-plays.dto';
export declare class MeController {
    private readonly me;
    constructor(me: MeService);
    overview(req: any): Promise<{
        company: {
            id: number;
            name: any;
            grade: any;
            ceo_name: any;
            phone: any;
            homepage_url: any;
            profile_image_url: any;
            smart_account_address: any;
            total_rewards_earned: number;
            total_rewards_used: number;
            reward_balance: number;
        } | null;
        subscription: {
            plan: any;
            status: string;
            start_date: any;
            end_date: any;
            next_billing_at: any;
            remaining_days: number | null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
        } | {
            plan: string;
            status: string;
            remaining_days: null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
            start_date?: undefined;
            end_date?: undefined;
            next_billing_at?: undefined;
        };
        api_key: {
            last4: null;
        };
        using_summary: {
            using_count: number;
        };
        using_list: any;
    }>;
    updateProfile(req: any, file: Express.Multer.File | undefined, dto: UpdateProfileDto): Promise<{
        company: {
            id: number;
            name: any;
            grade: any;
            ceo_name: any;
            phone: any;
            homepage_url: any;
            profile_image_url: any;
            smart_account_address: any;
            total_rewards_earned: number;
            total_rewards_used: number;
            reward_balance: number;
        } | null;
        subscription: {
            plan: any;
            status: string;
            start_date: any;
            end_date: any;
            next_billing_at: any;
            remaining_days: number | null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
        } | {
            plan: string;
            status: string;
            remaining_days: null;
            reserved_rewards_next_payment: number;
            max_usable_next_payment: number;
            start_date?: undefined;
            end_date?: undefined;
            next_billing_at?: undefined;
        };
        api_key: {
            last4: null;
        };
        using_summary: {
            using_count: number;
        };
        using_list: any;
    }>;
    subscribe(req: any, dto: SubscribeDto): Promise<any>;
    history(req: any): Promise<{
        purchases: any;
        mileageLogs: any;
    }>;
    rewards(req: any, q: GetMeRewardsQueryDto): Promise<{
        month: any;
        days: number;
        items: {
            musicId: number;
            title: string | null;
            coverImageUrl: string | null;
            playEndpoint: string;
            lyricsEndpoint: string;
            startDate: any;
            rewardPerPlay: number | null;
            monthBudget: number;
            monthSpent: number;
            monthRemaining: number;
            remainingByPlanCount: any;
            remainingByPlanAmount: number | null;
            lifetimeExtracted: number;
            lastUsedAt: any;
            daily: {
                date: string;
                amount: number;
            }[];
            leadersEarned: number;
        }[];
        totals: {
            monthBudget: number;
            monthSpent: number;
            monthRemaining: number;
            lifetimeExtracted: number;
        };
    }>;
    plays(req: any, q: GetMePlaysQueryDto): Promise<MePlaysResponseDto>;
    removeUsing(req: any, musicId: number): Promise<any>;
}
