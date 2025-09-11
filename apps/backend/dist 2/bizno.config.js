"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    biznoVerifier: process.env.BIZNO_VERIFIER ?? 'DB_ONLY',
    odcloud: {
        baseUrl: process.env.ODCLOUD_BASE_URL,
        key: process.env.ODCLOUD_SERVICE_KEY,
        keyEnc: process.env.ODCLOUD_SERVICE_KEY_ENC,
        returnType: process.env.ODCLOUD_RETURN_TYPE ?? 'JSON',
    },
});
//# sourceMappingURL=bizno.config.js.map