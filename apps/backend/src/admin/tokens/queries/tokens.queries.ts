import { db } from '../../../db/client'
import { companies, rewards, music_plays } from '../../../db/schema'
import { sql } from 'drizzle-orm'

export class TokensQueries {
  // 총 발행량 계산 (companies.total_rewards_earned 합계)
  async getTotalIssuedTokens(): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${companies.total_rewards_earned}::numeric), 0)`
      })
      .from(companies)
    
    return parseFloat(result[0].total.toString())
  }

  // 총 소각량 계산 (rewards 테이블에서 소각된 토큰)
  async getTotalBurnedTokens(): Promise<number> {
    // 소각은 일반적으로 특정 주소(0x000...000)로 전송되는 것으로 가정
    // 실제 구현에서는 소각 이벤트나 특정 상태를 확인해야 함
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${rewards.amount}::numeric), 0)`
      })
      .from(rewards)
      .where(sql`${rewards.status} = 'falied'`) // 실패한 리워드는 소각으로 간주
    
    return parseFloat(result[0].total.toString())
  }

  // 일별 배치 데이터 조회
  async getDailyBatches(limit: number, offset: number) {
    // music_plays와 rewards 테이블을 조인하여 일별 집계
    const result = await db
      .select({
        date: sql<string>`DATE(${music_plays.created_at})`,
        totalReward: sql<number>`COALESCE(SUM(${rewards.amount}::numeric), 0)`,
        dbValidPlayCount: sql<number>`COUNT(CASE WHEN ${music_plays.is_valid_play} = true THEN 1 END)`,
        onchainRecordedPlayCount: sql<number>`COUNT(CASE WHEN ${rewards.payout_tx_hash} IS NOT NULL THEN 1 END)`,
        executedAt: sql<string>`MAX(${rewards.blockchain_recorded_at})`,
        txHash: sql<string>`MAX(${rewards.payout_tx_hash})`,
        status: sql<string>`
          CASE 
            WHEN MAX(${rewards.payout_tx_hash}) IS NOT NULL THEN 'success'
            WHEN COUNT(CASE WHEN ${music_plays.is_valid_play} = true THEN 1 END) > 0 THEN 'not-executed'
            ELSE 'not-executed'
          END
        `,
        blockNumber: sql<number>`MAX(${rewards.block_number})`,
        gasUsed: sql<number>`MAX(${rewards.gas_used})`
      })
      .from(music_plays)
      .leftJoin(rewards, sql`${rewards.play_id} = ${music_plays.id}`)
      .where(sql`${music_plays.created_at} >= NOW() - INTERVAL '30 days'`)
      .groupBy(sql`DATE(${music_plays.created_at})`)
      .orderBy(sql`DATE(${music_plays.created_at}) DESC`)
      .limit(limit)
      .offset(offset)

    return result.map(row => ({
      id: row.date,
      date: row.date,
      executedAt: row.executedAt,
      totalReward: parseFloat(row.totalReward.toString()),
      dbValidPlayCount: parseInt(row.dbValidPlayCount.toString()),
      onchainRecordedPlayCount: parseInt(row.onchainRecordedPlayCount.toString()),
      txHash: row.txHash,
      status: row.status as 'success' | 'pending' | 'not-executed' | 'failed',
      mismatch: row.dbValidPlayCount !== row.onchainRecordedPlayCount,
      blockNumber: row.blockNumber,
      gasUsed: row.gasUsed
    }))
  }

  // 특정 날짜의 배치 상세 정보
  async getBatchDetail(date: string) {
    const result = await db
      .select({
        date: sql<string>`DATE(${music_plays.created_at})`,
        totalReward: sql<number>`COALESCE(SUM(${rewards.amount}::numeric), 0)`,
        dbValidPlayCount: sql<number>`COUNT(CASE WHEN ${music_plays.is_valid_play} = true THEN 1 END)`,
        onchainRecordedPlayCount: sql<number>`COUNT(CASE WHEN ${rewards.payout_tx_hash} IS NOT NULL THEN 1 END)`,
        executedAt: sql<string>`MAX(${rewards.blockchain_recorded_at})`,
        txHash: sql<string>`MAX(${rewards.payout_tx_hash})`,
        status: sql<string>`
          CASE 
            WHEN MAX(${rewards.payout_tx_hash}) IS NOT NULL THEN 'success'
            WHEN COUNT(CASE WHEN ${music_plays.is_valid_play} = true THEN 1 END) > 0 THEN 'not-executed'
            ELSE 'not-executed'
          END
        `,
        blockNumber: sql<number>`MAX(${rewards.block_number})`,
        gasUsed: sql<number>`MAX(${rewards.gas_used})`
      })
      .from(music_plays)
      .leftJoin(rewards, sql`${rewards.play_id} = ${music_plays.id}`)
      .where(sql`DATE(${music_plays.created_at}) = ${date}`)
      .groupBy(sql`DATE(${music_plays.created_at})`)

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.date,
      date: row.date,
      executedAt: row.executedAt,
      totalReward: parseFloat(row.totalReward.toString()),
      dbValidPlayCount: parseInt(row.dbValidPlayCount.toString()),
      onchainRecordedPlayCount: parseInt(row.onchainRecordedPlayCount.toString()),
      txHash: row.txHash,
      status: row.status as 'success' | 'pending' | 'not-executed' | 'failed',
      mismatch: row.dbValidPlayCount !== row.onchainRecordedPlayCount,
      blockNumber: row.blockNumber,
      gasUsed: row.gasUsed
    }
  }

  // 기업별 리워드 분배 데이터
  async getCompanyDistributions(date: string) {
    const result = await db
      .select({
        companyName: companies.name,
        amount: sql<number>`COALESCE(SUM(${rewards.amount}::numeric), 0)`,
        percent: sql<number>`0` // 나중에 계산
      })
      .from(music_plays)
      .leftJoin(rewards, sql`${rewards.play_id} = ${music_plays.id}`)
      .leftJoin(companies, sql`${companies.id} = ${music_plays.using_company_id}`)
      .where(sql`DATE(${music_plays.created_at}) = ${date} AND ${music_plays.is_valid_play} = true`)
      .groupBy(companies.name)
      .orderBy(sql`SUM(${rewards.amount}::numeric) DESC`)

    // 총합 계산
    const totalAmount = result.reduce((sum, row) => sum + parseFloat(row.amount.toString()), 0)
    
    return result.map(row => ({
      company: row.companyName,
      amount: parseFloat(row.amount.toString()),
      percent: totalAmount > 0 ? (parseFloat(row.amount.toString()) / totalAmount) * 100 : 0
    }))
  }

  // 유효재생 히스토리
  async getValidPlayHistory(date: string) {
    const result = await db
      .select({
        id: music_plays.id,
        time: sql<string>`TO_CHAR(${music_plays.created_at}, 'HH24:MI:SS')`,
        companyName: companies.name,
        musicTitle: sql<string>`m.title`,
        musicId: sql<string>`m.id::text`
      })
      .from(music_plays)
      .leftJoin(companies, sql`${companies.id} = ${music_plays.using_company_id}`)
      .leftJoin(sql`musics m`, sql`m.id = ${music_plays.music_id}`)
      .where(sql`DATE(${music_plays.created_at}) = ${date} AND ${music_plays.is_valid_play} = true`)
      .orderBy(music_plays.created_at)
      .limit(50) // 최대 50개만 표시

    return result.map(row => ({
      id: `play-${row.id}`,
      time: row.time,
      company: row.companyName,
      musicTitle: row.musicTitle,
      musicId: row.musicId
    }))
  }
}
