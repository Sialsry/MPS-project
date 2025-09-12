"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyMusicRewards = exports.rawTags = exports.musicTags = exports.musicCategories = exports.musicPlays = exports.rewards = exports.playlistItems = exports.playlists = exports.musics = exports.companySubscriptions = exports.companies = exports.businessNumbers = exports.useCase = exports.rewardStatus = exports.rewardCode = exports.rawTagType = exports.companyGrade = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.companyGrade = (0, pg_core_1.pgEnum)("company_grade", ['free', 'standard', 'business']);
exports.rawTagType = (0, pg_core_1.pgEnum)("raw_tag_type", ['genre', 'mood', 'context']);
exports.rewardCode = (0, pg_core_1.pgEnum)("reward_code", ['0', '1', '2', '3']);
exports.rewardStatus = (0, pg_core_1.pgEnum)("reward_status", ['pending', 'paid']);
exports.useCase = (0, pg_core_1.pgEnum)("use_case", ['0', '1', '2']);
exports.businessNumbers = (0, pg_core_1.pgTable)("business_numbers", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    companyId: (0, pg_core_1.bigint)("company_id", { mode: "number" }).notNull(),
    number: (0, pg_core_1.text)().notNull(),
});
exports.companies = (0, pg_core_1.pgTable)("companies", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    businessNumber: (0, pg_core_1.text)("business_number").notNull(),
    email: (0, pg_core_1.text)().notNull(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    phone: (0, pg_core_1.text)(),
    grade: (0, exports.companyGrade)().default('free').notNull(),
    ceoName: (0, pg_core_1.text)("ceo_name"),
    profileImageUrl: (0, pg_core_1.text)("profile_image_url"),
    homepageUrl: (0, pg_core_1.text)("homepage_url"),
    smartAccountAddress: (0, pg_core_1.text)("smart_account_address"),
    apiKeyHash: (0, pg_core_1.text)("api_key_hash"),
    totalRewardsEarned: (0, pg_core_1.numeric)("total_rewards_earned").default('0'),
    totalRewardsUsed: (0, pg_core_1.numeric)("total_rewards_used").default('0'),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("companies_name_unique").on(table.name),
    (0, pg_core_1.unique)("companies_business_number_unique").on(table.businessNumber),
    (0, pg_core_1.unique)("companies_email_unique").on(table.email),
    (0, pg_core_1.unique)("companies_smart_account_address_unique").on(table.smartAccountAddress),
]);
exports.companySubscriptions = (0, pg_core_1.pgTable)("company_subscriptions", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    companyId: (0, pg_core_1.bigint)("company_id", { mode: "number" }).notNull(),
    tier: (0, pg_core_1.varchar)({ length: 20 }).notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date", { withTimezone: true, mode: 'string' }).notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date", { withTimezone: true, mode: 'string' }).notNull(),
    totalPaidAmount: (0, pg_core_1.numeric)("total_paid_amount", { precision: 10, scale: 2 }),
    paymentCount: (0, pg_core_1.integer)("payment_count"),
    discountAmount: (0, pg_core_1.numeric)("discount_amount", { precision: 10, scale: 2 }),
    actualPaidAmount: (0, pg_core_1.numeric)("actual_paid_amount", { precision: 10, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
exports.musics = (0, pg_core_1.pgTable)("musics", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    filePath: (0, pg_core_1.varchar)("file_path", { length: 255 }).notNull(),
    title: (0, pg_core_1.text)().notNull(),
    artist: (0, pg_core_1.text)().notNull(),
    composer: (0, pg_core_1.text)(),
    musicArranger: (0, pg_core_1.text)("music_arranger"),
    lyricist: (0, pg_core_1.text)(),
    lyricsText: (0, pg_core_1.text)("lyrics_text"),
    lyricsFilePath: (0, pg_core_1.text)("lyrics_file_path"),
    inst: (0, pg_core_1.boolean)().default(false).notNull(),
    isrc: (0, pg_core_1.text)(),
    durationSec: (0, pg_core_1.integer)("duration_sec"),
    releaseDate: (0, pg_core_1.date)("release_date"),
    coverImageUrl: (0, pg_core_1.text)("cover_image_url"),
    lyricsDownloadCount: (0, pg_core_1.bigint)("lyrics_download_count", { mode: "number" }).default(0),
    pricePerPlay: (0, pg_core_1.numeric)("price_per_play"),
    lyricsPrice: (0, pg_core_1.numeric)("lyrics_price"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    categoryId: (0, pg_core_1.integer)("category_id"),
    gradeRequired: (0, pg_core_1.integer)("grade_required").default(0).notNull(),
    validPlayCount: (0, pg_core_1.bigint)("valid_play_count", { mode: "number" }).default(0),
    totalPlayCount: (0, pg_core_1.bigint)("total_play_count", { mode: "number" }).default(0),
    totalRewardedAmount: (0, pg_core_1.numeric)("total_rewarded_amount").default('0'),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue").default('0'),
    fileSizeBytes: (0, pg_core_1.bigint)("file_size_bytes", { mode: "number" }),
    lastPlayedAt: (0, pg_core_1.timestamp)("last_played_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
    (0, pg_core_1.unique)("musics_file_path_unique").on(table.filePath),
]);
exports.playlists = (0, pg_core_1.pgTable)("playlists", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    companyId: (0, pg_core_1.bigint)("company_id", { mode: "number" }).notNull(),
    name: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
exports.playlistItems = (0, pg_core_1.pgTable)("playlist_items", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    playlistId: (0, pg_core_1.bigint)("playlist_id", { mode: "number" }).notNull(),
    musicId: (0, pg_core_1.bigint)("music_id", { mode: "number" }).notNull(),
    addedAt: (0, pg_core_1.timestamp)("added_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
exports.rewards = (0, pg_core_1.pgTable)("rewards", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    companyId: (0, pg_core_1.bigint)("company_id", { mode: "number" }).notNull(),
    musicId: (0, pg_core_1.bigint)("music_id", { mode: "number" }).notNull(),
    playId: (0, pg_core_1.bigint)("play_id", { mode: "number" }).notNull(),
    rewardCode: (0, exports.rewardCode)("reward_code").notNull(),
    amount: (0, pg_core_1.numeric)().notNull(),
    status: (0, exports.rewardStatus)().default('pending').notNull(),
    payoutTxHash: (0, pg_core_1.text)("payout_tx_hash"),
    blockNumber: (0, pg_core_1.integer)("block_number"),
    gasUsed: (0, pg_core_1.bigint)("gas_used", { mode: "number" }),
    blockchainRecordedAt: (0, pg_core_1.timestamp)("blockchain_recorded_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
exports.musicPlays = (0, pg_core_1.pgTable)("music_plays", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    musicId: (0, pg_core_1.bigint)("music_id", { mode: "number" }).notNull(),
    usingCompanyId: (0, pg_core_1.bigint)("using_company_id", { mode: "number" }).notNull(),
    rewardAmount: (0, pg_core_1.numeric)("reward_amount").default('0'),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    transactionHash: (0, pg_core_1.text)("transaction_hash"),
    rewardCode: (0, exports.rewardCode)("reward_code").notNull(),
    useCase: (0, exports.useCase)("use_case").notNull(),
    usePrice: (0, pg_core_1.numeric)("use_price").default('0'),
    isValidPlay: (0, pg_core_1.boolean)("is_valid_play").default(false),
    playDurationSec: (0, pg_core_1.integer)("play_duration_sec"),
});
exports.musicCategories = (0, pg_core_1.pgTable)("music_categories", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("music_categories_name_unique").on(table.name),
]);
exports.musicTags = (0, pg_core_1.pgTable)("music_tags", {
    id: (0, pg_core_1.serial)().primaryKey().notNull(),
    text: (0, pg_core_1.text)().notNull(),
    musicId: (0, pg_core_1.bigint)("music_id", { mode: "number" }).notNull(),
    rawTagId: (0, pg_core_1.integer)("raw_tag_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
exports.rawTags = (0, pg_core_1.pgTable)("raw_tags", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    slug: (0, pg_core_1.text)().notNull(),
    type: (0, exports.rawTagType)().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("raw_tags_slug_unique").on(table.slug),
]);
exports.monthlyMusicRewards = (0, pg_core_1.pgTable)("monthly_music_rewards", {
    id: (0, pg_core_1.bigserial)({ mode: "bigint" }).primaryKey().notNull(),
    musicId: (0, pg_core_1.bigint)("music_id", { mode: "number" }).notNull(),
    yearMonth: (0, pg_core_1.varchar)("year_month", { length: 7 }).notNull(),
    totalRewardCount: (0, pg_core_1.integer)("total_reward_count").notNull(),
    remainingRewardCount: (0, pg_core_1.integer)("remaining_reward_count").notNull(),
    rewardPerPlay: (0, pg_core_1.numeric)("reward_per_play").notNull(),
    isAutoReset: (0, pg_core_1.boolean)("is_auto_reset").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
//# sourceMappingURL=schema.introspected.js.map