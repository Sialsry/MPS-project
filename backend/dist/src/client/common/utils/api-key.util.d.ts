import { ConfigService } from '@nestjs/config';
export type ApiKeyGenerateResult = {
    key: string;
    last4: string;
    kid: string;
    version: number;
    hash: string;
};
export declare class ApiKeyUtil {
    private readonly config;
    constructor(config: ConfigService);
    private static KEY_RE;
    generate(mode?: 'live' | 'test'): ApiKeyGenerateResult;
    hash(apiKeyPlain: string): string;
    verify(apiKeyPlain: string, storedHash: string): boolean;
    getKid(apiKeyPlain: string): string | null;
    mask(last4?: string | null): string;
    private requirePepper;
}
