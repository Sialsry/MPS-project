"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExploreSectionsDto = exports.ExploreSectionDto = exports.ExploreTrackDto = exports.RewardInfoDto = void 0;
class RewardInfoDto {
    reward_one;
    reward_total;
    reward_remain;
    total_count;
    remain_count;
}
exports.RewardInfoDto = RewardInfoDto;
class ExploreTrackDto {
    access;
    id;
    title;
    artist;
    cover_image_url;
    format;
    has_lyrics;
    grade_required;
    can_use;
    reward;
    popularity;
    created_at;
}
exports.ExploreTrackDto = ExploreTrackDto;
class ExploreSectionDto {
    key;
    title;
    items;
}
exports.ExploreSectionDto = ExploreSectionDto;
class ExploreSectionsDto {
    featured;
    news;
    charts;
    moods;
}
exports.ExploreSectionsDto = ExploreSectionsDto;
//# sourceMappingURL=explore.dto.js.map