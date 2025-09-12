"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensQueries = void 0;
const client_1 = require("../../../db/client");
const schema_1 = require("../../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class TokensQueries {
    async getTotalIssuedTokens() {
        const result = await client_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.companies.total_rewards_earned}::numeric), 0)`
        })
            .from(schema_1.companies);
        return parseFloat(result[0].total.toString());
    }
    async getTotalBurnedTokens() {
        const result = await client_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.rewards.amount}::numeric), 0)`
        })
            .from(schema_1.rewards)
            .where((0, drizzle_orm_1.sql) `${schema_1.rewards.status} = 'falied'`);
        return parseFloat(result[0].total.toString());
    }
    async getDailyBatches(limit, offset) {
        const result = await client_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at})`,
            totalReward: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.rewards.amount}::numeric), 0)`,
            dbValidPlayCount: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.music_plays.is_valid_play} = true THEN 1 END)`,
            onchainRecordedPlayCount: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.rewards.payout_tx_hash} IS NOT NULL THEN 1 END)`,
            executedAt: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.blockchain_recorded_at})`,
            txHash: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.payout_tx_hash})`,
            status: (0, drizzle_orm_1.sql) `
          CASE 
            WHEN MAX(${schema_1.rewards.payout_tx_hash}) IS NOT NULL THEN 'success'
            WHEN COUNT(CASE WHEN ${schema_1.music_plays.is_valid_play} = true THEN 1 END) > 0 THEN 'not-executed'
            ELSE 'not-executed'
          END
        `,
            blockNumber: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.block_number})`,
            gasUsed: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.gas_used})`
        })
            .from(schema_1.music_plays)
            .leftJoin(schema_1.rewards, (0, drizzle_orm_1.sql) `${schema_1.rewards.play_id} = ${schema_1.music_plays.id}`)
            .where((0, drizzle_orm_1.sql) `${schema_1.music_plays.created_at} >= NOW() - INTERVAL '30 days'`)
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at}) DESC`)
            .limit(limit)
            .offset(offset);
        return result.map(row => ({
            id: row.date,
            date: row.date,
            executedAt: row.executedAt,
            totalReward: parseFloat(row.totalReward.toString()),
            dbValidPlayCount: parseInt(row.dbValidPlayCount.toString()),
            onchainRecordedPlayCount: parseInt(row.onchainRecordedPlayCount.toString()),
            txHash: row.txHash,
            status: row.status,
            mismatch: row.dbValidPlayCount !== row.onchainRecordedPlayCount,
            blockNumber: row.blockNumber,
            gasUsed: row.gasUsed
        }));
    }
    async getBatchDetail(date) {
        const result = await client_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at})`,
            totalReward: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.rewards.amount}::numeric), 0)`,
            dbValidPlayCount: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.music_plays.is_valid_play} = true THEN 1 END)`,
            onchainRecordedPlayCount: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.rewards.payout_tx_hash} IS NOT NULL THEN 1 END)`,
            executedAt: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.blockchain_recorded_at})`,
            txHash: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.payout_tx_hash})`,
            status: (0, drizzle_orm_1.sql) `
          CASE 
            WHEN MAX(${schema_1.rewards.payout_tx_hash}) IS NOT NULL THEN 'success'
            WHEN COUNT(CASE WHEN ${schema_1.music_plays.is_valid_play} = true THEN 1 END) > 0 THEN 'not-executed'
            ELSE 'not-executed'
          END
        `,
            blockNumber: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.block_number})`,
            gasUsed: (0, drizzle_orm_1.sql) `MAX(${schema_1.rewards.gas_used})`
        })
            .from(schema_1.music_plays)
            .leftJoin(schema_1.rewards, (0, drizzle_orm_1.sql) `${schema_1.rewards.play_id} = ${schema_1.music_plays.id}`)
            .where((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at}) = ${date}`)
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at})`);
        if (result.length === 0)
            return null;
        const row = result[0];
        return {
            id: row.date,
            date: row.date,
            executedAt: row.executedAt,
            totalReward: parseFloat(row.totalReward.toString()),
            dbValidPlayCount: parseInt(row.dbValidPlayCount.toString()),
            onchainRecordedPlayCount: parseInt(row.onchainRecordedPlayCount.toString()),
            txHash: row.txHash,
            status: row.status,
            mismatch: row.dbValidPlayCount !== row.onchainRecordedPlayCount,
            blockNumber: row.blockNumber,
            gasUsed: row.gasUsed
        };
    }
    async getCompanyDistributions(date) {
        const result = await client_1.db
            .select({
            companyName: schema_1.companies.name,
            amount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.rewards.amount}::numeric), 0)`,
            percent: (0, drizzle_orm_1.sql) `0`
        })
            .from(schema_1.music_plays)
            .leftJoin(schema_1.rewards, (0, drizzle_orm_1.sql) `${schema_1.rewards.play_id} = ${schema_1.music_plays.id}`)
            .leftJoin(schema_1.companies, (0, drizzle_orm_1.sql) `${schema_1.companies.id} = ${schema_1.music_plays.using_company_id}`)
            .where((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at}) = ${date} AND ${schema_1.music_plays.is_valid_play} = true`)
            .groupBy(schema_1.companies.name)
            .orderBy((0, drizzle_orm_1.sql) `SUM(${schema_1.rewards.amount}::numeric) DESC`);
        const totalAmount = result.reduce((sum, row) => sum + parseFloat(row.amount.toString()), 0);
        return result.map(row => ({
            company: row.companyName,
            amount: parseFloat(row.amount.toString()),
            percent: totalAmount > 0 ? (parseFloat(row.amount.toString()) / totalAmount) * 100 : 0
        }));
    }
    async getValidPlayHistory(date) {
        const result = await client_1.db
            .select({
            id: schema_1.music_plays.id,
            time: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.music_plays.created_at}, 'HH24:MI:SS')`,
            companyName: schema_1.companies.name,
            musicTitle: (0, drizzle_orm_1.sql) `m.title`,
            musicId: (0, drizzle_orm_1.sql) `m.id::text`
        })
            .from(schema_1.music_plays)
            .leftJoin(schema_1.companies, (0, drizzle_orm_1.sql) `${schema_1.companies.id} = ${schema_1.music_plays.using_company_id}`)
            .leftJoin((0, drizzle_orm_1.sql) `musics m`, (0, drizzle_orm_1.sql) `m.id = ${schema_1.music_plays.music_id}`)
            .where((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at}) = ${date} AND ${schema_1.music_plays.is_valid_play} = true`)
            .orderBy(schema_1.music_plays.created_at)
            .limit(50);
        return result.map(row => ({
            id: `play-${row.id}`,
            time: row.time,
            company: row.companyName,
            musicTitle: row.musicTitle,
            musicId: row.musicId
        }));
    }
    async getTransactions(limit, offset) {
        const tokenDistributionTxs = await client_1.db
            .select({
            id: (0, drizzle_orm_1.sql) `'token-dist-' || DATE(${schema_1.rewards.blockchain_recorded_at})`,
            type: (0, drizzle_orm_1.sql) `'token-distribution'`,
            timestamp: (0, drizzle_orm_1.sql) `TO_CHAR(DATE(${schema_1.rewards.blockchain_recorded_at}), 'YYYY-MM-DD') || ' 00:00:00'`,
            txHash: schema_1.rewards.payout_tx_hash,
            status: (0, drizzle_orm_1.sql) `
          CASE 
            WHEN ${schema_1.rewards.payout_tx_hash} IS NOT NULL THEN 'success'
            WHEN ${schema_1.rewards.status} = 'pending' THEN 'pending'
            ELSE 'failed'
          END
        `,
            blockNumber: schema_1.rewards.block_number,
            gasUsed: schema_1.rewards.gas_used,
            gasPrice: (0, drizzle_orm_1.sql) `20`,
            totalAmount: (0, drizzle_orm_1.sql) `SUM(${schema_1.rewards.amount}::numeric)`,
            recipientCount: (0, drizzle_orm_1.sql) `COUNT(*)`
        })
            .from(schema_1.rewards)
            .where((0, drizzle_orm_1.sql) `${schema_1.rewards.blockchain_recorded_at} IS NOT NULL`)
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.rewards.blockchain_recorded_at})`, schema_1.rewards.payout_tx_hash, schema_1.rewards.block_number, schema_1.rewards.gas_used, schema_1.rewards.status)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.rewards.blockchain_recorded_at}) DESC`)
            .limit(limit / 2)
            .offset(offset / 2);
        const apiRecordingTxs = await client_1.db
            .select({
            id: (0, drizzle_orm_1.sql) `'api-rec-' || DATE(${schema_1.music_plays.created_at})`,
            type: (0, drizzle_orm_1.sql) `'api-recording'`,
            timestamp: (0, drizzle_orm_1.sql) `TO_CHAR(DATE(${schema_1.music_plays.created_at}), 'YYYY-MM-DD') || ' 00:00:00'`,
            txHash: (0, drizzle_orm_1.sql) `'0x' || lpad(to_hex(EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint), 8, '0') || lpad(to_hex((EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint % 1000000)), 8, '0') || '0000000000000001'`,
            status: (0, drizzle_orm_1.sql) `'success'`,
            blockNumber: (0, drizzle_orm_1.sql) `18000000 + (EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint % 1000000)::integer + 1`,
            gasUsed: (0, drizzle_orm_1.sql) `150000 + (EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint % 50000)::bigint`,
            gasPrice: (0, drizzle_orm_1.sql) `20`,
            recordCount: (0, drizzle_orm_1.sql) `COUNT(*)`
        })
            .from(schema_1.music_plays)
            .where((0, drizzle_orm_1.sql) `${schema_1.music_plays.is_valid_play} = true AND ${schema_1.music_plays.created_at} >= NOW() - INTERVAL '30 days'`)
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at}) DESC`)
            .limit(limit / 2)
            .offset(offset / 2);
        const allTransactions = [
            ...tokenDistributionTxs.map(tx => ({
                id: tx.id,
                type: tx.type,
                timestamp: tx.timestamp,
                txHash: tx.txHash || '',
                status: tx.status,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed,
                gasPrice: tx.gasPrice,
                tokenDistribution: {
                    totalAmount: parseFloat(tx.totalAmount.toString()),
                    recipientCount: parseInt(tx.recipientCount.toString()),
                    recipients: []
                }
            })),
            ...apiRecordingTxs.map(tx => ({
                id: tx.id,
                type: tx.type,
                timestamp: tx.timestamp,
                txHash: tx.txHash || '',
                status: tx.status,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed,
                gasPrice: tx.gasPrice,
                apiRecording: {
                    recordCount: parseInt(tx.recordCount.toString()),
                    records: []
                }
            }))
        ];
        return allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    async getTransactionDetail(id) {
        if (id.startsWith('token-dist-')) {
            const dateStr = id.replace('token-dist-', '');
            const result = await client_1.db
                .select({
                id: (0, drizzle_orm_1.sql) `'token-dist-' || DATE(${schema_1.rewards.blockchain_recorded_at})`,
                type: (0, drizzle_orm_1.sql) `'token-distribution'`,
                timestamp: (0, drizzle_orm_1.sql) `TO_CHAR(DATE(${schema_1.rewards.blockchain_recorded_at}), 'YYYY-MM-DD') || ' 00:00:00'`,
                txHash: schema_1.rewards.payout_tx_hash,
                status: (0, drizzle_orm_1.sql) `
            CASE 
              WHEN ${schema_1.rewards.payout_tx_hash} IS NOT NULL THEN 'success'
              WHEN ${schema_1.rewards.status} = 'pending' THEN 'pending'
              ELSE 'failed'
            END
          `,
                blockNumber: schema_1.rewards.block_number,
                gasUsed: schema_1.rewards.gas_used,
                gasPrice: (0, drizzle_orm_1.sql) `20`,
                amount: schema_1.rewards.amount,
                companyName: schema_1.companies.name,
                companyId: schema_1.rewards.company_id,
                musicId: schema_1.rewards.music_id,
                rewardCode: schema_1.rewards.reward_code,
                usedAt: schema_1.rewards.created_at
            })
                .from(schema_1.rewards)
                .leftJoin(schema_1.companies, (0, drizzle_orm_1.sql) `${schema_1.companies.id} = ${schema_1.rewards.company_id}`)
                .where((0, drizzle_orm_1.sql) `DATE(${schema_1.rewards.blockchain_recorded_at}) = ${dateStr}`)
                .orderBy(schema_1.rewards.created_at);
            if (result.length === 0)
                return null;
            const firstRow = result[0];
            const totalAmount = result.reduce((sum, row) => sum + parseFloat(row.amount.toString()), 0);
            return {
                id: firstRow.id,
                type: 'token-distribution',
                timestamp: firstRow.timestamp,
                txHash: firstRow.txHash || '',
                status: firstRow.status,
                blockNumber: firstRow.blockNumber,
                gasUsed: firstRow.gasUsed,
                gasPrice: firstRow.gasPrice,
                tokenDistribution: {
                    totalAmount: totalAmount,
                    recipientCount: result.length,
                    recipients: result.map(row => ({
                        company: row.companyName,
                        amount: parseFloat(row.amount.toString()),
                        companyId: parseInt(row.companyId.toString()),
                        musicId: parseInt(row.musicId.toString()),
                        rewardCode: row.rewardCode,
                        usedAt: row.usedAt
                    }))
                }
            };
        }
        else if (id.startsWith('api-rec-')) {
            const dateStr = id.replace('api-rec-', '');
            const result = await client_1.db
                .select({
                id: (0, drizzle_orm_1.sql) `'api-rec-' || DATE(${schema_1.music_plays.created_at})`,
                type: (0, drizzle_orm_1.sql) `'api-recording'`,
                timestamp: (0, drizzle_orm_1.sql) `TO_CHAR(DATE(${schema_1.music_plays.created_at}), 'YYYY-MM-DD') || ' 00:00:00'`,
                txHash: (0, drizzle_orm_1.sql) `'0x' || lpad(to_hex(EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint), 8, '0') || lpad(to_hex((EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint % 1000000)), 8, '0') || '0000000000000001'`,
                status: (0, drizzle_orm_1.sql) `'success'`,
                blockNumber: (0, drizzle_orm_1.sql) `18000000 + (EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint % 1000000)::integer + 1`,
                gasUsed: (0, drizzle_orm_1.sql) `150000 + (EXTRACT(EPOCH FROM DATE(${schema_1.music_plays.created_at}))::bigint % 50000)::bigint`,
                gasPrice: (0, drizzle_orm_1.sql) `20`,
                companyId: schema_1.music_plays.using_company_id,
                musicId: schema_1.music_plays.music_id,
                playId: schema_1.music_plays.id,
                rewardCode: (0, drizzle_orm_1.sql) `0`,
                companyName: schema_1.companies.name,
                usedAt: schema_1.music_plays.created_at
            })
                .from(schema_1.music_plays)
                .leftJoin(schema_1.companies, (0, drizzle_orm_1.sql) `${schema_1.companies.id} = ${schema_1.music_plays.using_company_id}`)
                .where((0, drizzle_orm_1.sql) `DATE(${schema_1.music_plays.created_at}) = ${dateStr} AND ${schema_1.music_plays.is_valid_play} = true`)
                .orderBy(schema_1.music_plays.created_at);
            if (result.length === 0)
                return null;
            const firstRow = result[0];
            return {
                id: firstRow.id,
                type: 'api-recording',
                timestamp: firstRow.timestamp,
                txHash: firstRow.txHash || '',
                status: firstRow.status,
                blockNumber: firstRow.blockNumber,
                gasUsed: firstRow.gasUsed,
                gasPrice: firstRow.gasPrice,
                apiRecording: {
                    recordCount: result.length,
                    records: result.map(row => ({
                        companyId: parseInt(row.companyId.toString()),
                        musicId: parseInt(row.musicId.toString()),
                        playId: parseInt(row.playId.toString()),
                        rewardCode: parseInt(row.rewardCode.toString()),
                        timestamp: row.usedAt,
                        companyName: row.companyName
                    }))
                }
            };
        }
        return null;
    }
}
exports.TokensQueries = TokensQueries;
//# sourceMappingURL=tokens.queries.js.map