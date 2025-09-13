"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CompaniesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const companies_repository_1 = require("./companies.repository");
const odcloud_client_1 = require("./odcloud.client");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const api_key_util_1 = require("../common/utils/api-key.util");
const blockchain_service_1 = require("./blockchain.service");
let CompaniesService = CompaniesService_1 = class CompaniesService {
    repo;
    odcloud;
    config;
    apiKeyUtil;
    blockchainService;
    logger = new common_1.Logger(CompaniesService_1.name);
    constructor(repo, odcloud, config, apiKeyUtil, blockchainService) {
        this.repo = repo;
        this.odcloud = odcloud;
        this.config = config;
        this.apiKeyUtil = apiKeyUtil;
        this.blockchainService = blockchainService;
    }
    normalizeBizno(s) {
        const n = (s ?? '').replace(/[^0-9]/g, '').trim();
        return n.length === 10 ? n : '';
    }
    isBiznoChecksumOk(s10) {
        if (!/^\d{10}$/.test(s10))
            return false;
        const w = [1, 3, 7, 1, 3, 7, 1, 3, 5], d = s10.split('').map(Number);
        let sum = 0;
        for (let i = 0; i < 9; i++)
            sum += d[i] * w[i];
        sum += Math.floor((d[8] * 5) / 10);
        return ((10 - (sum % 10)) % 10) === d[9];
    }
    async verifyWithNts(bizno) {
        try {
            const resp = await Promise.race([
                this.odcloud.status(bizno),
                new Promise((_, rej) => setTimeout(() => rej(new Error('NTS timeout')), 7000)),
            ]);
            const row = resp?.data?.[0];
            const matchCnt = Number(resp?.match_cnt ?? (Array.isArray(resp?.data) ? resp.data.length : 0));
            if (!row || matchCnt === 0) {
                return { ok: false, reason: 'NTS_NOT_REGISTERED' };
            }
            const closed = String(row.b_stt_cd) === '03' || String(row.b_stt || '').includes('폐업');
            if (closed) {
                return { ok: false, closed: true, tax_type: row.tax_type ?? null, reason: 'CLOSED' };
            }
            return { ok: true, tax_type: row.tax_type ?? null };
        }
        catch (e) {
            throw e;
        }
    }
    async create(dto, skipNts = false) {
        const bizno = this.normalizeBizno(dto.business_number);
        if (!this.isBiznoChecksumOk(bizno)) {
            throw new common_1.BadRequestException('사업자번호 형식 오류');
        }
        const dup = await this.repo.findDuplicate(dto.email, dto.name, bizno);
        if (dup)
            throw new common_1.ConflictException('이미 가입된 이메일/상호/사업자번호가 있습니다.');
        const mode = (this.config.get('BIZNO_VERIFIER') ?? 'HYBRID').trim().toUpperCase();
        let needNts = false;
        if (!skipNts) {
            if (mode === 'NTS_ONLY') {
                needNts = true;
            }
            else if (mode === 'HYBRID') {
                const existsLocal = await this.repo.existsBizno(bizno);
                needNts = !existsLocal;
            }
        }
        if (needNts) {
            try {
                const nts = await this.verifyWithNts(bizno);
                if (!nts.ok) {
                    if (nts.reason === 'CLOSED')
                        throw new common_1.BadRequestException('폐업 사업자');
                    throw new common_1.BadRequestException('유효하지 않은 사업자번호');
                }
            }
            catch (e) {
                if (this.config.get('STRICT_NTS') === '1') {
                    throw new common_1.BadRequestException('NTS_ERROR: ' + (e?.message ?? String(e)));
                }
                this.logger.warn(`NTS_ERROR(create): ${e?.message ?? e}`);
            }
        }
        const password_hash = await bcrypt.hash(dto.password, 10);
        const rawApiKey = (0, node_crypto_1.randomBytes)(32).toString('hex');
        const api_key_hash = (0, node_crypto_1.createHash)('sha256').update(rawApiKey).digest('hex');
        let smartAccountInfo = null;
        try {
            this.logger.log(`스마트 계정 생성 시작 - 이메일: ${dto.email}, 사업자번호: ${bizno}`);
            smartAccountInfo = await this.blockchainService.createSmartAccount(dto.email, bizno);
            this.logger.log(`스마트 계정 생성 완료 - EOA: ${smartAccountInfo.eoaAddress}, SmartAccount: ${smartAccountInfo.smartAccountAddress}`);
        }
        catch (error) {
            this.logger.error(`스마트 계정 생성 실패: ${error.message}`);
        }
        const [row] = await this.repo.insert({
            name: dto.name,
            business_number: bizno,
            email: dto.email,
            password_hash,
            phone: dto.phone ?? null,
            ceo_name: dto.ceo_name ?? null,
            profile_image_url: dto.profile_image_url ?? null,
            homepage_url: dto.homepage_url ?? null,
            api_key_hash,
            smart_account_address: smartAccountInfo?.smartAccountAddress ?? null,
        });
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            grade: row.grade,
            created_at: row.created_at,
            api_key: rawApiKey,
            api_key_hint: `${rawApiKey.slice(0, 4)}...${rawApiKey.slice(-4)}`,
            blockchain: smartAccountInfo ? {
                eoaAddress: smartAccountInfo.eoaAddress,
                smartAccountAddress: smartAccountInfo.smartAccountAddress,
                transactionHash: smartAccountInfo.transactionHash,
            } : null,
        };
    }
    deriveSubscriptionStatus(grade, sub) {
        if (grade === 'free')
            return 'free';
        if (!sub)
            return 'expired';
        const now = new Date();
        const start = new Date(sub.start_date);
        const end = new Date(sub.end_date);
        if (start <= now && now <= end)
            return 'active';
        if (now < start)
            return 'scheduled';
        return 'expired';
    }
    async validateByEmailPassword(email, password) {
        const normEmail = String(email).trim().toLowerCase();
        const row = await this.repo.findByEmail(normEmail);
        if (!row)
            return null;
        const ok = await bcrypt.compare(password, row.password_hash);
        if (!ok)
            return null;
        const latestSub = await this.repo.findLatestSubscription(row.id);
        const subscriptionStatus = this.deriveSubscriptionStatus(row.grade, latestSub);
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            grade: row.grade,
            profile_image_url: row.profile_image_url ?? null,
            subscriptionStatus,
            subscriptionTier: latestSub?.tier ?? null,
            subscriptionEndsAt: latestSub?.end_date ?? null,
        };
    }
    async getProfileById(id) {
        const row = await this.repo.findById(id);
        if (!row)
            return null;
        return row;
    }
    async verifyBizno(biznoInput, skipNts = false) {
        const bizno = this.normalizeBizno(biznoInput ?? '');
        if (!bizno) {
            return { ok: false, mode: 'CHECKSUM', source: 'CHECKSUM', business_number: bizno, reason: 'FORMAT_ERROR' };
        }
        const mode = (this.config.get('BIZNO_VERIFIER') ?? 'HYBRID').trim().toUpperCase();
        let localOk = false;
        try {
            localOk = await this.repo.existsBizno(bizno);
        }
        catch (e) {
            this.logger.warn(`LOCAL_ERROR(verify): ${e?.message ?? e}`);
        }
        let ntsOk = false;
        let ntsReason = null;
        let taxType = null;
        let ntsErrored = false;
        if (mode !== 'DB_ONLY' && !skipNts) {
            try {
                const nts = await this.verifyWithNts(bizno);
                ntsOk = !!nts.ok;
                taxType = nts.tax_type ?? null;
                ntsReason = nts.ok ? null : (nts.reason ?? 'NTS_NOT_REGISTERED');
            }
            catch (e) {
                ntsErrored = true;
                ntsReason = 'NTS_ERROR';
                this.logger.warn(`NTS_ERROR(verify): ${e?.message ?? e}`);
            }
        }
        else {
            ntsReason = mode === 'DB_ONLY' ? 'NTS_DISABLED' : 'NTS_SKIPPED';
        }
        let ok = localOk || ntsOk;
        let reason = null;
        let source = 'CLIENT';
        if (ok) {
            if (localOk) {
                source = 'LOCAL';
                reason = null;
            }
            else {
                source = 'NTS';
                reason = null;
            }
        }
        else {
            if (!localOk && ntsErrored && this.config.get('STRICT_NTS') !== '1') {
                ok = true;
                source = 'CHECKSUM';
                reason = 'NTS_UNAVAILABLE';
            }
            else {
                source = 'NTS';
                reason = ntsReason || (!localOk ? 'NOT_IN_LOCAL' : 'UNKNOWN');
            }
        }
        return { ok, mode, source, business_number: bizno, reason, tax_type: taxType };
    }
    async regenerateApiKey(companyId) {
        const id = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
        const { key, last4, kid, version, hash } = this.apiKeyUtil.generate('live');
        await this.repo.updateApiKeyByCompanyId(id, {
            api_key_hash: hash,
            api_key_id: kid,
            api_key_last4: last4,
            api_key_version: version,
        });
        return { api_key: key, last4 };
    }
    async createOrGetSmartAccount(companyId) {
        const company = await this.repo.findById(companyId);
        if (!company) {
            throw new common_1.BadRequestException('회사 정보를 찾을 수 없습니다.');
        }
        if (company.smart_account_address) {
            return {
                eoaAddress: null,
                smartAccountAddress: company.smart_account_address,
                isExisting: true,
            };
        }
        try {
            const smartAccountInfo = await this.blockchainService.createSmartAccount(company.email, company.business_number);
            await this.repo.updateSmartAccountAddress(companyId, smartAccountInfo.smartAccountAddress);
            return {
                eoaAddress: smartAccountInfo.eoaAddress,
                smartAccountAddress: smartAccountInfo.smartAccountAddress,
                transactionHash: smartAccountInfo.transactionHash,
                isExisting: false,
            };
        }
        catch (error) {
            this.logger.error(`스마트 계정 생성 실패 (Company ID: ${companyId}): ${error.message}`);
            throw new common_1.BadRequestException(`스마트 계정 생성에 실패했습니다: ${error.message}`);
        }
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = CompaniesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [companies_repository_1.CompaniesRepository,
        odcloud_client_1.OdcloudClient,
        config_1.ConfigService,
        api_key_util_1.ApiKeyUtil,
        blockchain_service_1.BlockchainService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map