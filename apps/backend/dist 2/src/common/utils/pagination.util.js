"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePagination = void 0;
const normalizePagination = (page, limit, max = 200) => {
    const p = Math.max(page ?? 1, 1);
    const l = Math.min(Math.max(limit ?? 10, 1), max);
    return { page: p, limit: l, offset: (p - 1) * l };
};
exports.normalizePagination = normalizePagination;
//# sourceMappingURL=pagination.util.js.map