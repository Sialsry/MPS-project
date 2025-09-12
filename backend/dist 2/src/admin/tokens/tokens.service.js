"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensService = void 0;
const common_1 = require("@nestjs/common");
const web3_service_1 = require("./web3.service");
const tokens_queries_1 = require("./queries/tokens.queries");
let TokensService = class TokensService {
    web3Service;
    tokensQueries;
    constructor(web3Service, tokensQueries) {
        this.web3Service = web3Service;
        this.tokensQueries = tokensQueries;
    }
    async getTokenInfo() {
        try {
            const onchainInfo = await this.web3Service.getTokenInfo();
            const totalIssued = await this.tokensQueries.getTotalIssuedTokens();
            const totalBurned = await this.tokensQueries.getTotalBurnedTokens();
            return {
                contractAddress: process.env.REWARD_TOKEN_CONTRACT_ADDRESS,
                totalSupply: onchainInfo.totalSupply,
                totalIssued: totalIssued,
                totalBurned: totalBurned,
                circulatingSupply: totalIssued - totalBurned,
                tokenName: onchainInfo.name,
                tokenSymbol: onchainInfo.symbol,
                decimals: onchainInfo.decimals
            };
        }
        catch (error) {
            console.error('토큰 정보 조회 실패:', error);
            throw new Error('토큰 정보를 가져올 수 없습니다');
        }
    }
    async getWalletInfo() {
        try {
            const walletAddress = process.env.WALLET_ADDRESS;
            if (!walletAddress) {
                throw new Error('WALLET_ADDRESS 환경 변수가 설정되지 않았습니다');
            }
            const ethBalance = await this.web3Service.getEthBalance(walletAddress);
            return {
                address: walletAddress,
                ethBalance: ethBalance,
                lastUpdated: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('지갑 정보 조회 실패:', error);
            throw new Error('지갑 정보를 가져올 수 없습니다');
        }
    }
    async getDailyBatches(dto) {
        try {
            const limit = parseInt(dto.limit || '10');
            const offset = parseInt(dto.offset || '0');
            return await this.tokensQueries.getDailyBatches(limit, offset);
        }
        catch (error) {
            console.error('일별 배치 조회 실패:', error);
            throw new Error('일별 배치 데이터를 가져올 수 없습니다');
        }
    }
    async getBatchDetail(dto) {
        try {
            const batch = await this.tokensQueries.getBatchDetail(dto.date);
            if (!batch) {
                throw new Error('해당 날짜의 배치 데이터를 찾을 수 없습니다');
            }
            const companyDistributions = await this.tokensQueries.getCompanyDistributions(dto.date);
            const validPlayHistory = await this.tokensQueries.getValidPlayHistory(dto.date);
            return {
                ...batch,
                companyDistributions,
                validPlayHistory
            };
        }
        catch (error) {
            console.error('배치 상세 조회 실패:', error);
            throw new Error('배치 상세 데이터를 가져올 수 없습니다');
        }
    }
    async getTransactions(dto) {
        try {
            const limit = parseInt(dto.limit || '20');
            const offset = parseInt(dto.offset || '0');
            return await this.tokensQueries.getTransactions(limit, offset);
        }
        catch (error) {
            console.error('트랜잭션 조회 실패:', error);
            throw new Error('트랜잭션 데이터를 가져올 수 없습니다');
        }
    }
    async getTransactionDetail(id) {
        try {
            return await this.tokensQueries.getTransactionDetail(id);
        }
        catch (error) {
            console.error('트랜잭션 상세 조회 실패:', error);
            throw new Error('트랜잭션 상세 데이터를 가져올 수 없습니다');
        }
    }
};
exports.TokensService = TokensService;
exports.TokensService = TokensService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [web3_service_1.Web3Service,
        tokens_queries_1.TokensQueries])
], TokensService);
//# sourceMappingURL=tokens.service.js.map