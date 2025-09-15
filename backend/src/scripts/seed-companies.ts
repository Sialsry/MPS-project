import 'dotenv/config'
import { db, pool } from '../db/client'
import { companies } from '../db/schema'
import type { InferInsertModel } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

type NewCompany = InferInsertModel<typeof companies>

function randomDate(from: Date, to: Date) {
    const fromMs = from.getTime()
    const toMs = to.getTime()
    const rnd = fromMs + Math.random() * (toMs - fromMs)
    return new Date(rnd)
}

function pad(n: number, len = 2) {
    return n.toString().padStart(len, '0')
}

function makeBusinessNumber(i: number) {
    // Simple deterministic unique-like number: 110-XX-YYYYY
    const mid = pad((i % 90) + 10) // 10-99
    const tail = pad(10000 + i, 5)
    return `110-${mid}-${tail}`
}

async function main() {
    const baseFrom = new Date('2025-01-01T00:00:00+09:00')
    const now = new Date()

    // grades: free 5, standard 5, business 10
    const gradePlan = [
        ...Array(5).fill('free'),
        ...Array(5).fill('standard'),
        ...Array(10).fill('business'),
    ] as const

    // Shuffle slightly to avoid strict blocks by grade
    const grades = [...gradePlan].sort(() => Math.random() - 0.5)

    const passwordHash = bcrypt.hashSync('Passw0rd!', 10)

    const rows: NewCompany[] = grades.map((grade, idx) => {
        const n = idx + 1
        const createdAt = randomDate(baseFrom, now)
        const name = `Demo Company ${pad(n, 2)}`
        return {
            name,
            business_number: makeBusinessNumber(n),
            email: `company${pad(n, 2)}@example.com`,
            password_hash: passwordHash,
            phone: `010-${pad(1000 + n, 4)}-${pad(1000 + (n * 7) % 9000, 4)}`,
            grade: grade as any,
            ceo_name: `CEO ${pad(n, 2)}`,
            profile_image_url: null,
            homepage_url: `https://company${pad(n, 2)}.example.com`,
            smart_account_address: null,
            api_key_hash: null,
            total_rewards_earned: '0' as any,
            total_rewards_used: '0' as any,
            created_at: createdAt as any,
            updated_at: createdAt as any,
        }
    })

    // Insert and ignore duplicates on unique columns (by name)
    await db
        .insert(companies)
        .values(rows)
        .onConflictDoNothing()

    console.log(`✅ Seeded companies: attempted ${rows.length}.`)
}

main()
    .catch((e) => {
        console.error('❌ seed-companies failed:', e)
        process.exitCode = 1
    })
    .finally(async () => {
        await pool.end()
    })
