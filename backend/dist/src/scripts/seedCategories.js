"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema = __importStar(require("../db/schema"));
const schema_1 = require("../db/schema");
const CATEGORIES = [
    { name: 'Pop' }, { name: '발라드' }, { name: '댄스' }, { name: '힙합' }, { name: 'R&B' },
    { name: '락' }, { name: '클래식' }, { name: '재즈' }, { name: '트로트' }, { name: 'OST' },
    { name: '인디' }, { name: '포크' }, { name: '뉴에이지' }, { name: 'EDM' }, { name: '랩' },
];
async function main() {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL)
        throw new Error('DATABASE_URL is not set');
    const client = new pg_1.Client({ connectionString: DATABASE_URL });
    await client.connect();
    const db = (0, node_postgres_1.drizzle)(client, { schema });
    await db.insert(schema_1.music_categories)
        .values(CATEGORIES)
        .onConflictDoNothing({ target: schema_1.music_categories.name });
    const result = await client.query('SELECT COUNT(*)::int AS cnt FROM music_categories;');
    console.log(`✅ music_categories seeded. current rows: ${result.rows[0].cnt}`);
    await client.end();
}
main().catch((err) => {
    console.error('❌ seed failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
});
//# sourceMappingURL=seedCategories.js.map