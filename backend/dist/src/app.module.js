"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const jwt_1 = require("@nestjs/jwt");
const path_1 = require("path");
const bizno_config_1 = __importDefault(require("../bizno.config"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const dashboard_module_1 = require("./admin/dashboard/dashboard.module");
const client_module_1 = require("./client/client.module");
const me_module_1 = require("./client/me/me.module");
const db_module_1 = require("./db/db.module");
const explore_module_1 = require("./client/explore/explore.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [
                    (0, path_1.join)(process.cwd(), 'apps/backend/.env'),
                    (0, path_1.join)(__dirname, '../../.env'),
                    '.env',
                ],
                load: [bizno_config_1.default],
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '30d' },
            }),
            admin_module_1.AdminModule,
            dashboard_module_1.DashboardModule,
            client_module_1.ClientModule,
            me_module_1.MeModule,
            db_module_1.DbModule,
            explore_module_1.ExploreModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map