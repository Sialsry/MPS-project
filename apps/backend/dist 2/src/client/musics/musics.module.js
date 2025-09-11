"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicsModule = void 0;
const common_1 = require("@nestjs/common");
const musics_service_1 = require("./musics.service");
const musics_controller_1 = require("./musics.controller");
let MusicsModule = class MusicsModule {
};
exports.MusicsModule = MusicsModule;
exports.MusicsModule = MusicsModule = __decorate([
    (0, common_1.Module)({
        controllers: [musics_controller_1.MusicsController],
        providers: [musics_service_1.MusicsService],
    })
], MusicsModule);
//# sourceMappingURL=musics.module.js.map