import { pgTable, bigint } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { companies } from './companies'
import { musics } from './musics'

export const company_musics = pgTable('company_musics', {
	company_id: bigint('company_id', { mode: 'number' })
		.notNull()
		.references(() => companies.id, { onDelete: 'cascade' }),
	music_id: bigint('music_id', { mode: 'number' })
		.notNull()
		.references(() => musics.id, { onDelete: 'cascade' }),
}, (t) => ({
	pk: { columns: [t.company_id, t.music_id], isPrimaryKey: true },
}))

export const company_musicsRelations = relations(company_musics, ({ one }) => ({
	company: one(companies, {
		fields: [company_musics.company_id],
		references: [companies.id],
	}),
	music: one(musics, {
		fields: [company_musics.music_id],
		references: [musics.id],
	}),
})) 