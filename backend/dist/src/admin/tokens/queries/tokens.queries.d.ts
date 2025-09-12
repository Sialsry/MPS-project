export declare class TokensQueries {
    getTotalIssuedTokens(): Promise<number>;
    getTotalBurnedTokens(): Promise<number>;
    getDailyBatches(limit: number, offset: number): Promise<{
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
    getBatchDetail(date: string): Promise<{
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
    } | null>;
    getCompanyDistributions(date: string): Promise<{
        company: string | null;
        amount: number;
        percent: number;
    }[]>;
    getValidPlayHistory(date: string): Promise<{
        id: string;
        time: string;
        company: string | null;
        musicTitle: string;
        musicId: string;
    }[]>;
    getTransactions(limit: number, offset: number): Promise<({
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
