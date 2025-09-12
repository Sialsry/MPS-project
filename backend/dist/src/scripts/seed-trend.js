"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
async function main() {
    const companyIds = [1, 2, 3];
    const musicIds = [18, 19, 20, 21, 22, 23, 24, 25];
    const monthsBack = Number(process.env.SEED_MONTHS ?? 12);
    const musicRatio = Number(process.env.SEED_MUSIC_RATIO ?? 0.6);
    const lyricsRatio = 1 - musicRatio;
    const tzOffsetMs = 9 * 3600 * 1000;
    const now = new Date();
    const anchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const deleteSince = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - (monthsBack - 1), 1));
    await client_1.db.execute(`DELETE FROM music_plays WHERE using_company_id IN (${companyIds.join(',')}) AND created_at >= '${deleteSince.toISOString()}'`);
    await client_1.db.execute(`DELETE FROM company_musics WHERE company_id IN (${companyIds.join(',')})`);
    for (const companyId of companyIds) {
        for (const musicId of musicIds) {
            await client_1.db.execute(`INSERT INTO company_musics (company_id, music_id)
				 SELECT ${companyId}, ${musicId}
				 WHERE NOT EXISTS (
				   SELECT 1 FROM company_musics WHERE company_id=${companyId} AND music_id=${musicId}
				 )`);
        }
    }
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function chooseUseCase() {
        return Math.random() < musicRatio ? 'music' : 'lyrics';
    }
    const ENUM_USECASE_MUSIC = '0';
    const ENUM_USECASE_LYRICS = '2';
    const ENUM_REWARD_MUSIC = '0';
    const ENUM_REWARD_LYRICS = '1';
    function rewardCodeByUseCase(useCase) {
        return useCase === 'music' ? ENUM_REWARD_MUSIC : ENUM_REWARD_LYRICS;
    }
    function useCaseEnumValue(useCase) {
        return useCase === 'music' ? ENUM_USECASE_MUSIC : ENUM_USECASE_LYRICS;
    }
    function rewardByUseCase(useCase, mul) {
        const base = useCase === 'music' ? 0.008 : 0.005;
        const jitter = useCase === 'music' ? 0.004 : 0.003;
        return Number(((base + Math.random() * jitter) * mul).toFixed(3));
    }
    const scaleByCompany = {
        1: { min: 40, max: 70, rewardMul: 1.0 },
        2: { min: 20, max: 40, rewardMul: 0.85 },
        3: { min: 8, max: 18, rewardMul: 0.7 },
    };
    for (let i = monthsBack - 1; i >= 0; i--) {
        const monthStart = new Date(anchor);
        monthStart.setUTCMonth(anchor.getUTCMonth() - i);
        const nextMonth = new Date(monthStart);
        nextMonth.setUTCMonth(monthStart.getUTCMonth() + 1);
        for (let d = new Date(monthStart); d < nextMonth; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
            for (const companyId of companyIds) {
                const scale = scaleByCompany[companyId];
                const plays = randInt(scale.min, scale.max);
                for (let k = 0; k < plays; k++) {
                    const musicId = musicIds[randInt(0, musicIds.length - 1)];
                    const sec = randInt(0, 86399);
                    const ts = new Date(d.getTime() + sec * 1000 + tzOffsetMs);
                    const useCaseRaw = chooseUseCase();
                    const reward = rewardByUseCase(useCaseRaw, scale.rewardMul);
                    const rewardCode = rewardCodeByUseCase(useCaseRaw);
                    const useCaseEnum = useCaseEnumValue(useCaseRaw);
                    const duration = randInt(45, 240);
                    await client_1.db.insert(schema_1.music_plays).values({
                        music_id: musicId,
                        using_company_id: companyId,
                        is_valid_play: true,
                        reward_amount: reward,
                        reward_code: rewardCode,
                        use_case: useCaseEnum,
                        use_price: 0.01,
                        play_duration_sec: duration,
                        created_at: ts,
                    });
                }
            }
        }
    }
    console.log(`Seed completed: ${monthsBack} months, ratio music:${musicRatio} lyrics:${lyricsRatio}`);
}
main().then(() => client_1.pool.end()).catch((e) => { console.error(e); client_1.pool.end(); process.exit(1); });
//# sourceMappingURL=seed-trend.js.map