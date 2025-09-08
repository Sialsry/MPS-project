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
exports.MusicService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
let MusicService = class MusicService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(musicId) {
        const result = await this.db
            .select()
            .from(schema_1.musics)
            .where((0, drizzle_orm_1.eq)(schema_1.musics.id, musicId));
        return result[0] || null;
    }
    async findActiveSession(musicId, companyId) {
        const tenMinutesAgo = new DataTransfer();
    }
    async startPlaySession(sessionData) {
        const playRecord = await this.db
            .insert(schema_1.music_plays)
            .values({
            music_id: Number(sessionData.musicId),
            using_company_id: Number(sessionData.companyId),
            reward_code: sessionData.rewardCode,
            use_case: sessionData.useCase,
            is_valid_play: false,
            reward_amount: sessionData.rewardAmount.toString(),
            use_price: sessionData.usePrice.toString(),
        })
            .returning();
        return playRecord[0];
    }
    async markAsValidPlay() { }
};
exports.MusicService = MusicService;
exports.MusicService = MusicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], MusicService);
//# sourceMappingURL=music.service.new.js.map