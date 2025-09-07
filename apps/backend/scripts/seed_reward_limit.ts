import 'dotenv/config';
import { db } from '../src/db/client';
import { music_plays, musics, companies } from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * 목적: 특정 회사(companyId)와 음원(musicId)에 대해
 * 이미 reward_code='1' & is_valid_play=true 인 레코드 5000개를 미리 만들어
 * 한도 초과 상황(reward_code='3')을 테스트할 수 있게 한다.
 *
 * 사용 전 조건:
 *  - companies 테이블에 대상 companyId 존재
 *  - musics 테이블에 대상 musicId 존재
 *  - (선택) 기존 동일 조건 레코드 삭제하거나 clean 상태 권장
 */

interface Options {
    companyId: number;
    musicId: number;
    batchSize?: number; // 한번에 insert 할 묶음 (기본 500)
    targetCount?: number; // 누적 목표 valid reward count (기본 5000)
}

async function ensureExists(table: any, id: number, label: string) {
    const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
    if (!rows[0]) throw new Error(`${label} (id=${id}) 가 존재하지 않습니다.`);
}

async function countExisting(companyId: number, musicId: number) {
    const rows = await db.execute<{ c: number }>(sql`SELECT COUNT(*)::int as c FROM music_plays WHERE using_company_id=${companyId} AND music_id=${musicId} AND is_valid_play = true AND reward_code='1'`);
    return rows[0]?.c || 0;
}

async function seedRewardLimit(opts: Options) {
    const companyId = opts.companyId;
    const musicId = opts.musicId;
    const batchSize = opts.batchSize ?? 500;
    const targetCount = opts.targetCount ?? 5000;

    console.log(`🚀 리워드 한도 테스트 데이터 생성 시작 (company=${companyId}, music=${musicId})`);
    await ensureExists(companies, companyId, 'company');
    await ensureExists(musics, musicId, 'music');

    let existing = await countExisting(companyId, musicId);
    console.log(`현재 valid reward 재생 수: ${existing}`);
    if (existing >= targetCount) {
        console.log('이미 목표 개수 이상 존재. 추가 생성 없이 종료.');
        return;
    }

    const toCreate = targetCount - existing;
    console.log(`생성 필요 수: ${toCreate}`);

    const now = new Date();
    let created = 0;
    while (created < toCreate) {
        const chunk = Math.min(batchSize, toCreate - created);
        const rows = Array.from({ length: chunk }).map(() => ({
            music_id: musicId,
            using_company_id: companyId,
            reward_code: '1' as const,
            use_case: '0' as const,
            is_valid_play: true,
            play_duration_sec: 120,
            reward_amount: '10', // 임의
            use_price: '0',
            created_at: now,
            updated_at: now,
        }));
        await db.insert(music_plays).values(rows);
        created += chunk;
        process.stdout.write(`  -> 누적 생성: ${created}/${toCreate}\r`);
    }

    console.log(`\n✅ 총 ${created}개 생성 완료.`);

    const final = await countExisting(companyId, musicId);
    console.log(`최종 valid reward 재생 수: ${final}`);
    console.log('이제 동일 회사/음원 재생 시 company 한도 초과(reward_code=\'3\') 시나리오를 확인할 수 있습니다.');
}

// CLI 실행 지원
// 사용 예:
//   npx ts-node scripts/seed_reward_limit.ts --company=2 --music=2 --target=5000

function parseArgs(): { companyId: number; musicId: number; targetCount?: number } {
    const args = process.argv.slice(2);
    const out: any = {};
    for (const a of args) {
        const [k, v] = a.split('=');
        if (k === '--company') out.companyId = Number(v);
        if (k === '--music') out.musicId = Number(v);
        if (k === '--target') out.targetCount = Number(v);
    }
    if (!out.companyId || !out.musicId) {
        console.error('필수 인자 누락: --company=<id> --music=<id> [--target=5000]');
        process.exit(1);
    }
    return out;
}

if (require.main === module) {
    parseArgs();
    const { companyId, musicId, targetCount } = parseArgs();
    seedRewardLimit({ companyId, musicId, targetCount }).then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}

export { seedRewardLimit };
