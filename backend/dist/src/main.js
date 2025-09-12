"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const fs_1 = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    const UPLOAD_ROOT = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(UPLOAD_ROOT))
        (0, fs_1.mkdirSync)(UPLOAD_ROOT, { recursive: true });
    app.use('/uploads', express_1.default.static(UPLOAD_ROOT));
    app.enableCors({
        origin: [
            'https://client.klk1.store',
            'https://admin.klk1.store',
            'http://localhost:3000',
            'http://localhost:4001',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.use((req, _res, next) => {
        if (req.originalUrl?.startsWith('/me')) {
            console.log('[REQ /me]', {
                url: req.originalUrl,
                hasAuthHeader: Boolean(req.headers.authorization),
                hasCookie_mps_at: Boolean(req.cookies?.mps_at),
            });
        }
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
//# sourceMappingURL=main.js.map