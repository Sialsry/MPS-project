"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../db/client");
const drizzle_orm_1 = require("drizzle-orm");
let RealtimeService = class RealtimeService {
    async getRealtimeData() {
        try {
            const apiCalls = await this.getRecentApiCalls();
            const topTracks = await this.getTopTracks();
            return {
                apiCalls,
                topTracks,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('실시간 데이터 조회 실패:', error);
            throw error;
        }
    }
    async getRecentApiCalls() {
        const query = (0, drizzle_orm_1.sql) `
      SELECT 
        mp.id,
        CASE 
          WHEN mp.is_valid_play = true AND mp.reward_code = '1' THEN 'success'
          ELSE 'error'
        END as status,
        CASE 
          WHEN mp.use_case IN ('0', '1') THEN '/api/music/play'
          WHEN mp.use_case = '2' THEN '/api/lyrics/get'
          ELSE '/api/unknown'
        END as endpoint,
        CASE 
          WHEN mp.use_case IN ('0', '1') THEN '음원 호출'
          WHEN mp.use_case = '2' THEN '가사 호출'
          ELSE '알 수 없음'
        END as call_type,
        CASE 
          WHEN mp.is_valid_play = true AND mp.reward_code = '1' THEN '유효재생'
          ELSE '무효재생'
        END as validity,
        c.name as company,
        TO_CHAR(mp.created_at AT TIME ZONE 'Asia/Seoul', 'HH24:MI:SS') as timestamp
      FROM music_plays mp
      LEFT JOIN companies c ON c.id = mp.using_company_id
      WHERE mp.created_at >= NOW() - INTERVAL '5 minutes'
      ORDER BY mp.created_at DESC
      LIMIT 50
    `;
        const result = await client_1.db.execute(query);
        return result.rows.map((row) => ({
            id: row.id,
            status: row.status,
            endpoint: row.endpoint,
            callType: row.call_type,
            validity: row.validity,
            company: row.company || '알 수 없음',
            timestamp: row.timestamp
        }));
    }
    async getTopTracks() {
        const query = (0, drizzle_orm_1.sql) `
      SELECT 
        m.id,
        m.title,
        COUNT(mp.*) FILTER (WHERE mp.is_valid_play = true AND mp.reward_code = '1') as valid_plays,
        ROW_NUMBER() OVER (ORDER BY COUNT(mp.*) FILTER (WHERE mp.is_valid_play = true AND mp.reward_code = '1') DESC) as rank
      FROM musics m
      LEFT JOIN music_plays mp ON mp.music_id = m.id
        AND mp.created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY m.id, m.title
      HAVING COUNT(mp.*) FILTER (WHERE mp.is_valid_play = true AND mp.reward_code = '1') > 0
      ORDER BY valid_plays DESC
      LIMIT 10
    `;
        const result = await client_1.db.execute(query);
        return result.rows.map((row) => ({
            id: row.id,
            rank: Number(row.rank),
            title: row.title,
            validPlays: Number(row.valid_plays)
        }));
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = __decorate([
    (0, common_1.Injectable)()
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map