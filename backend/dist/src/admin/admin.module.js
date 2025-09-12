"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const musics_module_1 = require("./musics/musics.module");
const company_module_1 = require("./company/company.module");
const system_module_1 = require("./system/system.module");
const tokens_module_1 = require("./tokens/tokens.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule,
            musics_module_1.MusicsModule,
            company_module_1.CompanyModule,
            system_module_1.SystemModule,
            tokens_module_1.TokensModule,]
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map