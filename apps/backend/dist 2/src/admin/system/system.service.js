"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const system_queries_1 = require("./queries/system.queries");
const client_1 = require("../../db/client");
let SystemService = class SystemService {
    async getApiStats(dto) {
        const query = (0, system_queries_1.buildApiStatsQuery)(dto.period || '24h');
        const result = await client_1.db.execute(query);
        const stats = result.rows[0];
        return {
            musicCalls: Number(stats.music_calls || 0),
            lyricsCalls: Number(stats.lyrics_calls || 0),
            totalCalls: Number(stats.total_calls || 0),
            activeApiKeys: Number(stats.active_api_keys || 0),
            musicCallsChange: Number(stats.music_calls_change || 0),
            lyricsCallsChange: Number(stats.lyrics_calls_change || 0),
            totalCallsChange: Number(stats.total_calls_change || 0),
            activeApiKeysChange: Number(stats.active_api_keys_change || 0)
        };
    }
    async getApiChart(dto) {
        const query = (0, system_queries_1.buildApiChartQuery)(dto.period || '24h');
        const result = await client_1.db.execute(query);
        const data = result.rows;
        return {
            labels: data.map(row => row.label),
            freeCalls: data.map(row => Number(row.free_calls || 0)),
            standardCalls: data.map(row => Number(row.standard_calls || 0)),
            businessCalls: data.map(row => Number(row.business_calls || 0)),
            musicCalls: data.map(row => Number(row.music_calls || 0)),
            lyricsCalls: data.map(row => Number(row.lyrics_calls || 0))
        };
    }
    async getApiKeys(dto) {
        const query = (0, system_queries_1.buildApiKeysQuery)(dto);
        const result = await client_1.db.execute(query);
        const data = result.rows;
        return data.map(row => ({
            companyId: row.company_id,
            company: row.company_name,
            key: row.api_key,
            created: row.created_at,
            lastUsed: row.last_used,
            totalCalls: Number(row.total_calls || 0),
            musicCalls: Number(row.music_calls || 0),
            lyricsCalls: Number(row.lyrics_calls || 0)
        }));
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)()
], SystemService);
//# sourceMappingURL=system.service.js.map