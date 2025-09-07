import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class ApiKeyService {
    private db;
    constructor(db: NodePgDatabase<any>);
    validateApiKey(apiKey: string): Promise<any | null>;
    private hashApiKey;
}
