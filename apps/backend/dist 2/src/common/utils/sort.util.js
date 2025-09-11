"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSort = void 0;
const normalizeSort = (sortBy, order, allowList = []) => {
    const safeSortBy = allowList.includes(sortBy || '') ? sortBy : allowList[0];
    const safeOrder = order === 'desc' ? 'desc' : 'asc';
    return { sortBy: safeSortBy, order: safeOrder };
};
exports.normalizeSort = normalizeSort;
//# sourceMappingURL=sort.util.js.map