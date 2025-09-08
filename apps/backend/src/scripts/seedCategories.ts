// import { pgTable } from 'drizzle-orm/pg-core';
// // src/scripts/seedCategories.ts
// import 'dotenv/config';
// import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
// import { Client } from 'pg';
// import * as schema from '../db/schema';
// import { musicCategories } from '../db/schema';

// // 테이블 정의에서 insert 타입 자동 추론
// type NewCategory = typeof musicCategories.$inferInsert;

// async function main() {
//   const { DATABASE_URL } = process.env as { DATABASE_URL?: string };
//   if (!DATABASE_URL) {
//     // catch에서 안전하게 다루기 위해 에러는 Error 인스턴스로
//     throw new Error('DATABASE_URL is not set');
//   }

//   // Client 타입은 pg가 제공 → no-unsafe-construction 사라짐
//   const client = new Client({ connectionString: DATABASE_URL });
//   await client.connect();

//   // 스키마를 연결해서 db에 정확한 타입 부여
//   const db: NodePgDatabase<typeof schema> = drizzle(client, { schema });

//   const rows: NewCategory[] = [
//     { name: 'Pop' },
//     { name: '발라드' },
//     { name: '댄스' },
//     { name: '힙합' },
//     { name: 'R&B' },
//     { name: '락' },
//     { name: '클래식' },
//     { name: '재즈' },
//     { name: '트로트' },
//     { name: 'OST' },
//     { name: '인디' },
//     { name: '포크' },
//     { name: '뉴에이지' },
//     { name: 'EDM' },
//     { name: '랩' },
//   ];

//   // UNIQUE(name) 기준으로 중복 무시 (유니크 인덱스 있어야 함)
//   await db
//     .insert(musicCategories)
//     .values(rows)
//     .onConflictDoNothing({ target: musicCategories.name });

//   console.log('categories seeded');
//   await client.end();
// }

// main().catch((err: unknown) => {
//   if (err instanceof Error) {
//     console.error(err.message);
//   } else {
//     console.error(String(err));
//   }
//   process.exit(1);
// });
