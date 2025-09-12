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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExploreController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const explore_service_1 = require("./explore.service");
function pickBearer(req) {
    const h = req.headers?.authorization || req.headers?.Authorization;
    if (typeof h === 'string' && h.startsWith('Bearer '))
        return h.slice(7);
    const cookie = req.cookies?.mps_at;
    return cookie ?? null;
}
let ExploreController = class ExploreController {
    explore;
    jwt;
    constructor(explore, jwt) {
        this.explore = explore;
        this.jwt = jwt;
    }
    async getSections(req) {
        const token = pickBearer(req);
        let user = null;
        if (token) {
            try {
                user = await this.jwt.verifyAsync(token);
            }
            catch { }
        }
        const isAuth = !!user;
        const companyId = Number(user?.sub ?? 0);
        const grade = (user?.grade ?? 'free');
        return this.explore.getSections(companyId, grade, isAuth);
    }
};
exports.ExploreController = ExploreController;
__decorate([
    (0, common_1.Get)('sections'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExploreController.prototype, "getSections", null);
exports.ExploreController = ExploreController = __decorate([
    (0, common_1.Controller)('explore'),
    __metadata("design:paramtypes", [explore_service_1.ExploreService,
        jwt_1.JwtService])
], ExploreController);
//# sourceMappingURL=explore.controller.js.map