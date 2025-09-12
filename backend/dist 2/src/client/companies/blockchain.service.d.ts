import { ConfigService } from '@nestjs/config';
export declare class BlockchainService {
    private readonly config;
    private readonly logger;
    private provider;
    private paymasterWallet;
    private smartAccountFactory;
    constructor(config: ConfigService);
    private initializeProvider;
    private createPrivateKey;
    getSmartAccountAddress(ownerAddress: string): Promise<string>;
    isSmartAccountExists(ownerAddress: string): Promise<boolean>;
    createSmartAccount(email: string, businessNumber: string): Promise<{
        eoaAddress: string;
        smartAccountAddress: string;
        transactionHash?: string;
    }>;
}
