import { DailyBatchesDto, BatchDetailDto, TransactionsDto } from './dto/tokens.dto';
import { Web3Service } from './web3.service';
import { TokensQueries } from './queries/tokens.queries';
export declare class TokensService {
    private readonly web3Service;
    private readonly tokensQueries;
    constructor(web3Service: Web3Service, tokensQueries: TokensQueries);
    getTokenInfo(): Promise<{
        contractAddress: string | undefined;
        totalSupply: string;
        totalIssued: number;
        totalBurned: number;
        circulatingSupply: number;
        tokenName: any;
        tokenSymbol: any;
        decimals: number;
    }>;
    getWalletInfo(): Promise<{
        address: string;
        ethBalance: number;
        lastUpdated: string;
    }>;
    getDailyBatches(dto: DailyBatchesDto): Promise<{
        id: string;
        date: string;
        executedAt: string;
        totalReward: number;
        dbValidPlayCount: number;
        onchainRecordedPlayCount: number;
        txHash: string;
        status: "success" | "pending" | "not-executed" | "failed";
        mismatch: boolean;
        blockNumber: number;
        gasUsed: number;
    }[]>;
    getBatchDetail(dto: BatchDetailDto): Promise<{
        companyDistributions: {
            company: string | null;
            amount: number;
            percent: number;
        }[];
        validPlayHistory: {
            id: string;
            time: string;
            company: string | null;
            musicTitle: string;
            musicId: string;
        }[];
        id: string;
        date: string;
        executedAt: string;
        totalReward: number;
        dbValidPlayCount: number;
        onchainRecordedPlayCount: number;
        txHash: string;
        status: "success" | "pending" | "not-executed" | "failed";
        mismatch: boolean;
        blockNumber: number;
        gasUsed: number;
    }>;
    getTransactions(dto: TransactionsDto): Promise<({
        id: string;
        type: "token-distribution";
        timestamp: string;
        txHash: string;
        status: "success" | "pending" | "failed";
        blockNumber: number | null;
        gasUsed: number | null;
        gasPrice: number;
        tokenDistribution: {
            totalAmount: number;
            recipientCount: number;
            recipients: never[];
        };
    } | {
        id: string;
        type: "api-recording";
        timestamp: string;
        txHash: string;
        status: "success" | "pending" | "failed";
        blockNumber: number;
        gasUsed: number;
        gasPrice: number;
        apiRecording: {
            recordCount: number;
            records: never[];
        };
    })[]>;
    getTransactionDetail(id: string): Promise<{
        id: string;
        type: "token-distribution";
        timestamp: string;
        txHash: string;
        status: "success" | "pending" | "failed";
        blockNumber: number | null;
        gasUsed: number | null;
        gasPrice: number;
        tokenDistribution: {
            totalAmount: number;
            recipientCount: number;
            recipients: {
                company: string | null;
                amount: number;
                companyId: number;
                musicId: number;
                rewardCode: "0" | "1" | "2" | "3";
                usedAt: Date | null;
            }[];
        };
        apiRecording?: undefined;
    } | {
        id: string;
        type: "api-recording";
        timestamp: string;
        txHash: string;
        status: "success" | "pending" | "failed";
        blockNumber: number;
        gasUsed: number;
        gasPrice: number;
        apiRecording: {
            recordCount: number;
            records: {
                companyId: number;
                musicId: number;
                playId: number;
                rewardCode: number;
                timestamp: Date | null;
                companyName: string | null;
            }[];
        };
        tokenDistribution?: undefined;
    } | null>;
}
