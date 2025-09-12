import { CompaniesRepository } from './companies.repository';
import { OdcloudClient } from './odcloud.client';
import { CreateCompanyDto } from './dto/create-companie.dto';
import { ConfigService } from '@nestjs/config';
import { ApiKeyUtil } from '../common/utils/api-key.util';
import { BlockchainService } from './blockchain.service';
type VerifyResp = {
    ok: boolean;
    mode: string;
    source: 'LOCAL' | 'NTS' | 'CHECKSUM' | 'CLIENT';
    business_number: string;
    reason?: string | null;
    tax_type?: string | null;
    error?: string;
};
export declare class CompaniesService {
    private readonly repo;
    private readonly odcloud;
    private readonly config;
    private readonly apiKeyUtil;
    private readonly blockchainService;
    private readonly logger;
    constructor(repo: CompaniesRepository, odcloud: OdcloudClient, config: ConfigService, apiKeyUtil: ApiKeyUtil, blockchainService: BlockchainService);
    private normalizeBizno;
    private isBiznoChecksumOk;
    private verifyWithNts;
    create(dto: CreateCompanyDto, skipNts?: boolean): Promise<{
        id: number;
        name: string;
        email: string;
        grade: "free" | "standard" | "business";
        created_at: Date | null;
        api_key: string;
        api_key_hint: string;
        blockchain: {
            eoaAddress: string;
            smartAccountAddress: string;
            transactionHash: string | undefined;
        } | null;
    }>;
    private deriveSubscriptionStatus;
    validateByEmailPassword(email: string, password: string): Promise<{
        id: number;
        name: string;
        email: string;
        grade: "free" | "standard" | "business";
        profile_image_url: string | null;
        subscriptionStatus: "free" | "active" | "expired" | "scheduled";
        subscriptionTier: any;
        subscriptionEndsAt: any;
    } | null>;
    getProfileById(id: number): Promise<{
        id: number;
        name: string;
        created_at: Date | null;
        updated_at: Date | null;
        business_number: string;
        email: string;
        password_hash: string;
        phone: string | null;
        grade: "free" | "standard" | "business";
        ceo_name: string | null;
        profile_image_url: string | null;
        homepage_url: string | null;
        smart_account_address: string | null;
        api_key_hash: string | null;
        total_rewards_earned: string | null;
        total_rewards_used: string | null;
    } | null>;
    verifyBizno(biznoInput: string, skipNts?: boolean): Promise<VerifyResp>;
    regenerateApiKey(companyId: number | string): Promise<{
        api_key: string;
        last4: string;
    }>;
    createOrGetSmartAccount(companyId: number): Promise<{
        eoaAddress: null;
        smartAccountAddress: string;
        isExisting: boolean;
        transactionHash?: undefined;
    } | {
        eoaAddress: string;
        smartAccountAddress: string;
        transactionHash: string | undefined;
        isExisting: boolean;
    }>;
}
export {};
