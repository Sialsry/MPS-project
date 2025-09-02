import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { companies } from '../apps/backend/src/db/schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
    constructor(
        @Inject('DB') private db: NodePgDatabase<any>,
    ) { }

    /**
     * API 키 검증
     * @param apiKey 클라이언트에서 전송된 API 키
     * @returns 검증된 회사 정보 또는 null
     */
    async validateApiKey(apiKey: string): Promise<any | null> {
        if (!apiKey) {
            return null;
        }

        // API 키를 해시화하여 데이터베이스의 해시와 비교
        const apiKeyHash = this.hashApiKey(apiKey);

        const companies_result = await this.db
            .select()
            .from(companies)
            .where(eq(companies.api_key_hash, apiKeyHash));

        console.log(companies_result, 'api 키 검증 결과')
        if (companies_result.length === 0) {
            return null;
        }

        return companies_result[0];
    }

    /**
     * 새로운 API 키 생성
     * @param companyId 회사 ID
     * @returns 생성된 API 키 (원문)
     */
    async generateApiKey(companyId: number): Promise<string> {
        // 32바이트 랜덤 문자열 생성
        const apiKey = crypto.randomBytes(32).toString('hex');

        // API 키 해시화
        const apiKeyHash = this.hashApiKey(apiKey);

        // 데이터베이스에 해시 저장
        await this.db
            .update(companies)
            .set({
                api_key_hash: apiKeyHash,
                updated_at: new Date(),
            })
            .where(eq(companies.id, companyId));

        return apiKey;
    }

    /**
     * API 키 무효화
     * @param companyId 회사 ID
     */
    async revokeApiKey(companyId: number): Promise<void> {
        await this.db
            .update(companies)
            .set({
                api_key_hash: null,
                updated_at: new Date(),
            })
            .where(eq(companies.id, companyId));
    }

    /**
     * API 키 해시화
     * @param apiKey 원본 API 키
     * @returns 해시된 API 키
     */
    private hashApiKey(apiKey: string): string {
        return crypto.createHash('sha256').update(apiKey).digest('hex');
    }

    /**
     * API 키 형식 검증
     * @param apiKey API 키
     * @returns 유효성 여부
     */
    isValidApiKeyFormat(apiKey: string): boolean {
        // 64자리 16진수 문자열인지 확인
        const hexPattern = /^[a-f0-9]{64}$/i;
        return hexPattern.test(apiKey);
    }
}
