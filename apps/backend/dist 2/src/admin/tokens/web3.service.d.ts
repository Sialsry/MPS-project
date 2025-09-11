export declare class Web3Service {
    private web3;
    private rewardTokenContract;
    private recordUsageContract;
    constructor();
    getTokenInfo(): Promise<{
        name: any;
        symbol: any;
        decimals: number;
        totalSupply: string;
    }>;
    getEthBalance(address: string): Promise<number>;
    getTokenBalance(address: string): Promise<number>;
    getTransferEvents(fromBlock: number, toBlock: number): Promise<{
        transactionHash: any;
        blockNumber: any;
        from: string;
        to: string;
        value: string;
    }[]>;
    getBlockRangeForDate(date: string): Promise<{
        fromBlock: number;
        toBlock: number;
    }>;
}
