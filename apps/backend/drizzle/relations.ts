import { relations } from "drizzle-orm/relations";
import { companies, companyMusics, musics } from "./schema";

export const companyMusicsRelations = relations(companyMusics, ({one}) => ({
	company: one(companies, {
		fields: [companyMusics.companyId],
		references: [companies.id]
	}),
	music: one(musics, {
		fields: [companyMusics.musicId],
		references: [musics.id]
	}),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	companyMusics: many(companyMusics),
}));

export const musicsRelations = relations(musics, ({many}) => ({
	companyMusics: many(companyMusics),
}));