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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const node_crypto_1 = require("node:crypto");
const fs = __importStar(require("fs"));
const companies_service_1 = require("./companies.service");
const create_companie_dto_1 = require("./dto/create-companie.dto");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'profile');
if (!fs.existsSync(UPLOAD_DIR))
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
let CompaniesController = class CompaniesController {
    companiesService;
    constructor(companiesService) {
        this.companiesService = companiesService;
    }
    async register(file, dto, skipNts) {
        if (file) {
            dto.profile_image_url = `/uploads/profile/${file.filename}`;
        }
        const shouldSkip = skipNts === '1' || skipNts === 'true';
        return this.companiesService.create(dto, shouldSkip);
    }
    verifyBusinessNumber(bNo, skipNts) {
        const shouldSkip = skipNts === '1' || skipNts === 'true';
        return this.companiesService.verifyBizno(bNo, shouldSkip);
    }
    async rotateById(id) {
        console.log("들어온다");
        return this.companiesService.regenerateApiKey(id);
    }
    async createOrGetSmartAccount(id) {
        return this.companiesService.createOrGetSmartAccount(id);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profile_image', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
            filename: (_req, file, cb) => {
                const id = (0, node_crypto_1.randomBytes)(16).toString('hex');
                cb(null, `${id}${(0, path_1.extname)(file.originalname || '')}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (/^image\/(png|jpe?g|gif|webp|avif)$/.test(file.mimetype))
                cb(null, true);
            else
                cb(new common_1.BadRequestException('이미지 파일만 업로드 가능합니다.'), false);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('skipNts')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_companie_dto_1.CreateCompanyDto, String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('business_numbers'),
    __param(0, (0, common_1.Query)('bNo')),
    __param(1, (0, common_1.Query)('skipNts')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "verifyBusinessNumber", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-api-key'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "rotateById", null);
__decorate([
    (0, common_1.Post)(':id/smart-account'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "createOrGetSmartAccount", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, common_1.Controller)('companies'),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map