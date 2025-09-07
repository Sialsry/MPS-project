"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorResponseDto = exports.DownloadLyricResponseDto = exports.PlayMusicResponseDto = void 0;
class PlayMusicResponseDto {
    success;
    message;
    data;
}
exports.PlayMusicResponseDto = PlayMusicResponseDto;
class DownloadLyricResponseDto {
    success;
    message;
    data;
}
exports.DownloadLyricResponseDto = DownloadLyricResponseDto;
class ApiErrorResponseDto {
    success;
    error;
    statusCode;
    timestamp;
}
exports.ApiErrorResponseDto = ApiErrorResponseDto;
//# sourceMappingURL=music-response.dto.js.map