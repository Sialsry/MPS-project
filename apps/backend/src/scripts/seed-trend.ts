import 'dotenv/config'
import { db, pool } from '../db/client'
import { music_plays } from '../db/schema'

async function main() {
	// 설정: 최근 N개월, 회사별 스케일링
	const companyIds = [1, 2, 3]
	const musicIds = [18, 19, 20, 21, 22, 23, 24, 25]
	const monthsBack = 12
	const tzOffsetMs = 9 * 3600 * 1000 // KST
	const now = new Date()
	const anchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

	// 기존 더미 삭제(선택): music_plays에서 해당 회사/음원 조합의 최근 N개월 범위 삭제
	await db.execute(`DELETE FROM music_plays WHERE using_company_id IN (${companyIds.join(',')})`)
	await db.execute(`DELETE FROM company_musics WHERE company_id IN (${companyIds.join(',')})`)

	// company_musics 매핑 복구
	for (const companyId of companyIds) {
		for (const musicId of musicIds) {
			await db.execute(
				`INSERT INTO company_musics (company_id, music_id)
				 SELECT ${companyId}, ${musicId}
				 WHERE NOT EXISTS (
				   SELECT 1 FROM company_musics WHERE company_id=${companyId} AND music_id=${musicId}
				 )`
			)
		}
	}

	function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

	// 회사별 일일 호출 스케일 (평균 차이를 내기 위해 계수 다르게)
	const scaleByCompany: Record<number, { min: number; max: number; rewardMul: number }> = {
		1: { min: 20, max: 35, rewardMul: 1.0 },   // 높은 트래픽
		2: { min: 10, max: 20, rewardMul: 0.85 }, // 중간 트래픽, 리워드 약간 낮게
		3: { min: 5,  max: 12, rewardMul: 0.7 },  // 낮은 트래픽, 리워드 더 낮게
	}

	for (let i = monthsBack - 1; i >= 0; i--) {
		const monthStart = new Date(anchor)
		monthStart.setUTCMonth(anchor.getUTCMonth() - i)
		const nextMonth = new Date(monthStart)
		nextMonth.setUTCMonth(monthStart.getUTCMonth() + 1)

		for (let d = new Date(monthStart); d < nextMonth; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
			for (const companyId of companyIds) {
				const scale = scaleByCompany[companyId]
				const plays = randInt(scale.min, scale.max)
				for (let k = 0; k < plays; k++) {
					const musicId = musicIds[randInt(0, musicIds.length - 1)]
					const sec = randInt(0, 86399)
					const ts = new Date(d.getTime() + sec * 1000 + tzOffsetMs)
					const reward = Number(((0.005 + Math.random() * 0.007) * scale.rewardMul).toFixed(3))
					const rewardCode = String(randInt(0, 3)) as any
					const useCase = String(randInt(0, 2)) as any
					const duration = randInt(60, 180)

					await db.insert(music_plays).values({
						music_id: musicId,
						using_company_id: companyId,
						is_valid_play: true,
						reward_amount: reward as any,
						reward_code: rewardCode,
						use_case: useCase,
						use_price: 0.01 as any,
						play_duration_sec: duration,
						created_at: ts as any,
					})
				}
			}
		}
	}

	console.log('Seed 12 months completed.')
}

main().then(() => pool.end()).catch((e) => { console.error(e); pool.end(); process.exit(1) }) 