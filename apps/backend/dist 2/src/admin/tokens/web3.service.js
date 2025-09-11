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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Service = void 0;
const common_1 = require("@nestjs/common");
const web3_1 = __importDefault(require("web3"));
let Web3Service = class Web3Service {
    web3;
    rewardTokenContract;
    recordUsageContract;
    constructor() {
        this.web3 = new web3_1.default(process.env.INFURA_RPC);
        const erc20Abi = [
            {
                "constant": true,
                "inputs": [],
                "name": "name",
                "outputs": [{ "name": "", "type": "string" }],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [{ "name": "", "type": "string" }],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [{ "name": "", "type": "uint8" }],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{ "name": "", "type": "uint256" }],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{ "name": "_owner", "type": "address" }],
                "name": "balanceOf",
                "outputs": [{ "name": "balance", "type": "uint256" }],
                "type": "function"
            }
        ];
        this.rewardTokenContract = new this.web3.eth.Contract(erc20Abi, process.env.REWARD_TOKEN_CONTRACT_ADDRESS);
    }
    async getTokenInfo() {
        try {
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                this.rewardTokenContract.methods.name().call(),
                this.rewardTokenContract.methods.symbol().call(),
                this.rewardTokenContract.methods.decimals().call(),
                this.rewardTokenContract.methods.totalSupply().call()
            ]);
            return {
                name,
                symbol,
                decimals: parseInt(decimals),
                totalSupply: this.web3.utils.fromWei(totalSupply, 'ether')
            };
        }
        catch (error) {
            console.error('토큰 정보 조회 실패:', error);
            throw error;
        }
    }
    async getEthBalance(address) {
        try {
            const balance = await this.web3.eth.getBalance(address);
            return parseFloat(this.web3.utils.fromWei(balance, 'ether'));
        }
        catch (error) {
            console.error('ETH 잔액 조회 실패:', error);
            throw error;
        }
    }
    async getTokenBalance(address) {
        try {
            const balance = await this.rewardTokenContract.methods.balanceOf(address).call();
            return parseFloat(this.web3.utils.fromWei(balance, 'ether'));
        }
        catch (error) {
            console.error('토큰 잔액 조회 실패:', error);
            throw error;
        }
    }
    async getTransferEvents(fromBlock, toBlock) {
        try {
            const transferEventSignature = this.web3.utils.keccak256('Transfer(address,address,uint256)');
            const events = await this.web3.eth.getPastLogs({
                address: process.env.REWARD_TOKEN_CONTRACT_ADDRESS,
                topics: [transferEventSignature],
                fromBlock,
                toBlock
            });
            return events.map((event) => ({
                transactionHash: event.transactionHash || '',
                blockNumber: event.blockNumber || 0,
                from: '0x' + (event.topics?.[1] || '').slice(26),
                to: '0x' + (event.topics?.[2] || '').slice(26),
                value: this.web3.utils.fromWei(event.data || '0', 'ether')
            }));
        }
        catch (error) {
            console.error('Transfer 이벤트 조회 실패:', error);
            throw error;
        }
    }
    async getBlockRangeForDate(date) {
        try {
            const startOfDay = new Date(date + 'T00:00:00Z');
            const endOfDay = new Date(date + 'T23:59:59Z');
            const currentBlock = await this.web3.eth.getBlockNumber();
            const currentTime = Math.floor(Date.now() / 1000);
            const blockTime = 12;
            const timeDiff = currentTime - Math.floor(startOfDay.getTime() / 1000);
            const blockDiff = Math.floor(timeDiff / blockTime);
            const fromBlock = Math.max(0, Number(currentBlock) - blockDiff - 100);
            const toBlock = Number(currentBlock) - blockDiff + 100;
            return { fromBlock, toBlock };
        }
        catch (error) {
            console.error('블록 범위 조회 실패:', error);
            throw error;
        }
    }
};
exports.Web3Service = Web3Service;
exports.Web3Service = Web3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], Web3Service);
//# sourceMappingURL=web3.service.js.map