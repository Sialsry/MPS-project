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
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const SmartAccountFactory_1 = require("./abi/SmartAccountFactory");
let BlockchainService = BlockchainService_1 = class BlockchainService {
    config;
    logger = new common_1.Logger(BlockchainService_1.name);
    provider;
    paymasterWallet;
    smartAccountFactory;
    constructor(config) {
        this.config = config;
        this.initializeProvider();
    }
    initializeProvider() {
        try {
            const rpcUrl = this.config.get('INFURA_RPC');
            const privateKey = this.config.get('PRIVATE_KEY');
            const factoryAddress = this.config.get('SmartAccountFactory');
            if (!rpcUrl || !privateKey || !factoryAddress) {
                throw new Error('블록체인 설정이 누락되었습니다. INFURA_RPC, PRIVATE_KEY, SmartAccountFactory를 확인하세요.');
            }
            this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            this.paymasterWallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
            this.smartAccountFactory = new ethers_1.ethers.Contract(factoryAddress, SmartAccountFactory_1.SMART_ACCOUNT_FACTORY_ABI, this.paymasterWallet);
        }
        catch (error) {
            this.logger.error('블록체인 초기화 실패:', error);
            throw error;
        }
    }
    createPrivateKey(email, salt, businessNumber) {
        const companyId = `${email}_${businessNumber}`;
        const value = (0, ethers_1.solidityPacked)(["string", "string"], [salt, companyId]).slice(0, 64);
        const pk = (0, ethers_1.keccak256)(value).replace("0x", "").slice(0, 64);
        return `0x${pk}`;
    }
    async getSmartAccountAddress(ownerAddress) {
        try {
            return await this.smartAccountFactory.getAccount(ownerAddress);
        }
        catch (error) {
            this.logger.error('스마트 계정 주소 조회 실패:', error);
            throw error;
        }
    }
    async isSmartAccountExists(ownerAddress) {
        try {
            const smartAccountAddress = await this.getSmartAccountAddress(ownerAddress);
            return smartAccountAddress !== ethers_1.ethers.ZeroAddress;
        }
        catch (error) {
            this.logger.error('스마트 계정 존재 여부 확인 실패:', error);
            return false;
        }
    }
    async createSmartAccount(email, businessNumber) {
        try {
            const salt = "dummy_salt";
            const privateKey = this.createPrivateKey(email, salt, businessNumber);
            const wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
            const ownerAddress = wallet.address;
            this.logger.log(`EOA 주소 생성: ${ownerAddress}`);
            const existingSmartAccount = await this.getSmartAccountAddress(ownerAddress);
            if (existingSmartAccount !== ethers_1.ethers.ZeroAddress) {
                this.logger.log(`기존 스마트 계정 발견: ${existingSmartAccount}`);
                return {
                    eoaAddress: ownerAddress,
                    smartAccountAddress: existingSmartAccount,
                };
            }
            this.logger.log('새 스마트 계정 생성 중...');
            const transaction = await this.smartAccountFactory.createAccount(ownerAddress);
            const receipt = await transaction.wait();
            const smartAccountAddress = await this.getSmartAccountAddress(ownerAddress);
            this.logger.log(`스마트 계정 생성 완료: ${smartAccountAddress}`);
            this.logger.log(`트랜잭션 해시: ${receipt.hash}`);
            return {
                eoaAddress: ownerAddress,
                smartAccountAddress,
                transactionHash: receipt.hash,
            };
        }
        catch (error) {
            this.logger.error('스마트 계정 생성 실패:', error);
            throw new Error(`스마트 계정 생성 중 오류가 발생했습니다: ${error.message}`);
        }
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map