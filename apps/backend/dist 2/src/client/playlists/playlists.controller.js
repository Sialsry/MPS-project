"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const playlists_service_1 = require("./playlists.service");
const update_playlist_dto_1 = require("./dto/update-playlist.dto");
const remove_tracks_dto_1 = require("./dto/remove-tracks.dto");
const use_playlist_dto_1 = require("./dto/use-playlist.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_playlist_dto_1 = require("./dto/create-playlist.dto");
let PlaylistsController = class PlaylistsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        const companyId = Number(req.user?.sub);
        return this.service.create(companyId, dto);
    }
    list(req) {
        const companyId = Number(req.user?.sub);
        return this.service.list(companyId);
    }
    detail(req, playlistId) {
        const companyId = Number(req.user?.sub);
        return this.service.detail(companyId, playlistId);
    }
    tracks(req, playlistId) {
        const companyId = Number(req.user?.sub);
        return this.service.tracks(companyId, playlistId);
    }
    replaceTracks(req, playlistId, dto) {
        const companyId = Number(req.user?.sub);
        return this.service.replaceTracks(companyId, playlistId, dto.trackIds);
    }
    removeTracks(req, playlistId, dto) {
        const companyId = Number(req.user?.sub);
        return this.service.removeTracks(companyId, playlistId, dto.trackIds);
    }
    remove(req, playlistId) {
        const companyId = Number(req.user?.sub);
        return this.service.remove(companyId, playlistId);
    }
    use(req, playlistId, dto) {
        const companyId = Number(req.user?.sub);
        return this.service.use(companyId, playlistId, dto);
    }
};
exports.PlaylistsController = PlaylistsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_playlist_dto_1.CreatePlaylistDto]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':playlistId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "detail", null);
__decorate([
    (0, common_1.Get)(':playlistId/tracks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "tracks", null);
__decorate([
    (0, common_1.Put)(':playlistId/tracks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_playlist_dto_1.UpdatePlaylistDto]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "replaceTracks", null);
__decorate([
    (0, common_1.Post)(':playlistId/tracks:remove'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, remove_tracks_dto_1.RemoveTracksDto]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "removeTracks", null);
__decorate([
    (0, common_1.Delete)(':playlistId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':playlistId/use'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, use_playlist_dto_1.UsePlaylistDto]),
    __metadata("design:returntype", void 0)
], PlaylistsController.prototype, "use", null);
exports.PlaylistsController = PlaylistsController = __decorate([
    (0, swagger_1.ApiTags)('playlists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('playlist'),
    __metadata("design:paramtypes", [playlists_service_1.PlaylistService])
], PlaylistsController);
//# sourceMappingURL=playlists.controller.js.map