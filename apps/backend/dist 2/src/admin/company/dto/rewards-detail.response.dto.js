"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsDetailResponseDto = exports.RewardsDetailCompanyDto = exports.RewardsDetailSummaryDto = exports.RewardsDetailByMusicDto = exports.RewardsDetailDailyDto = void 0;
class RewardsDetailDailyDto {
    date;
    earned;
    used;
}
exports.RewardsDetailDailyDto = RewardsDetailDailyDto;
class RewardsDetailByMusicDto {
    musicId;
    title;
    artist;
    category;
    validPlays;
    earned;
}
exports.RewardsDetailByMusicDto = RewardsDetailByMusicDto;
class RewardsDetailSummaryDto {
    totalTokens;
    monthlyEarned;
    monthlyUsed;
    usageRate;
    activeTracks;
    yearMonth;
}
exports.RewardsDetailSummaryDto = RewardsDetailSummaryDto;
class RewardsDetailCompanyDto {
    id;
    name;
    tier;
}
exports.RewardsDetailCompanyDto = RewardsDetailCompanyDto;
class RewardsDetailResponseDto {
    company;
    summary;
    daily;
    byMusic;
}
exports.RewardsDetailResponseDto = RewardsDetailResponseDto;
//# sourceMappingURL=rewards-detail.response.dto.js.map