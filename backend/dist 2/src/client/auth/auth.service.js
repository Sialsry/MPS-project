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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const companies_service_1 = require("../companies/companies.service");
let AuthService = class AuthService {
    companies;
    jwt;
    constructor(companies, jwt) {
        this.companies = companies;
        this.jwt = jwt;
    }
    async validate(email, password) {
        return this.companies.validateByEmailPassword(email, password);
    }
    async login(email, password) {
        const company = await this.companies.validateByEmailPassword(email, password);
        if (!company)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = {
            sub: company.id,
            grade: company.grade,
            subscriptionStatus: company.subscriptionStatus ?? null,
            name: company.name,
            email: company.email,
            profile_image_url: company.profile_image_url ?? null,
        };
        const accessToken = await this.jwt.signAsync(payload, { expiresIn: '1h' });
        return {
            tokenType: 'Bearer',
            accessToken,
            expiresIn: 100000,
            company: {
                id: company.id,
                name: company.name,
                email: company.email,
                grade: company.grade,
                profile_image_url: company.profile_image_url ?? null,
                subscriptionStatus: company.subscriptionStatus ?? null,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map