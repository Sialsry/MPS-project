ALTER TABLE "musics" DROP CONSTRAINT "musics_isrc_unique";--> statement-breakpoint
ALTER TABLE "music_tags" ALTER COLUMN "raw_tag_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "musics" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "music_plays" DROP COLUMN "api_latency";--> statement-breakpoint
ALTER TABLE "music_plays" DROP COLUMN "played_at";