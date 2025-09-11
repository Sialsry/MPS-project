"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDayRangeCTE = exports.getDayRangeSqlKST = exports.buildMonthRangeCTE = exports.getMonthRangeSqlKST = exports.getMonthStartEndSqlKST = exports.isCurrentYM = exports.resolveYMToYearMonth = exports.getPrevYearMonthKST = exports.resolveYearMonthKST = exports.getDefaultYearMonthKST = exports.isValidYearMonth = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const isValidYearMonth = (s) => !!s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
exports.isValidYearMonth = isValidYearMonth;
const getDefaultYearMonthKST = () => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 3600 * 1000);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
};
exports.getDefaultYearMonthKST = getDefaultYearMonthKST;
const resolveYearMonthKST = (ym) => (0, exports.isValidYearMonth)(ym) ? ym : (0, exports.getDefaultYearMonthKST)();
exports.resolveYearMonthKST = resolveYearMonthKST;
const getPrevYearMonthKST = (ym) => {
    const base = (0, exports.resolveYearMonthKST)(ym);
    const [y, m] = base.split('-').map(Number);
    const prev = new Date(Date.UTC(y, m - 2, 1));
    const py = prev.getUTCFullYear();
    const pm = String(prev.getUTCMonth() + 1).padStart(2, '0');
    return `${py}-${pm}`;
};
exports.getPrevYearMonthKST = getPrevYearMonthKST;
const resolveYMToYearMonth = (ym) => {
    const r = (0, exports.resolveYearMonthKST)(ym);
    const [year, month] = r.split('-').map(Number);
    return { year, month };
};
exports.resolveYMToYearMonth = resolveYMToYearMonth;
const isCurrentYM = (ym) => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 3600 * 1000);
    const y = kst.getUTCFullYear();
    const m = kst.getUTCMonth() + 1;
    const [yy, mm] = ym.split('-').map(Number);
    return y === yy && m === mm;
};
exports.isCurrentYM = isCurrentYM;
const getMonthStartEndSqlKST = (y, m) => {
    return {
        start: `make_timestamptz(${y}, ${m}, 1, 0, 0, 0, 'Asia/Seoul')`,
        end: `(make_timestamptz(${y}, ${m}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second'`,
    };
};
exports.getMonthStartEndSqlKST = getMonthStartEndSqlKST;
const getMonthRangeSqlKST = (y, m) => {
    return {
        start: (0, drizzle_orm_1.sql) `make_timestamptz(${y}, ${m}, 1, 0, 0, 0, 'Asia/Seoul')`,
        end: (0, drizzle_orm_1.sql) `(make_timestamptz(${y}, ${m}, 1, 0, 0, 0, 'Asia/Seoul') + interval '1 month') - interval '1 second'`,
    };
};
exports.getMonthRangeSqlKST = getMonthRangeSqlKST;
const buildMonthRangeCTE = (y, m) => {
    const { start, end } = (0, exports.getMonthRangeSqlKST)(y, m);
    return (0, drizzle_orm_1.sql) `
    WITH month_range AS (
      SELECT ${start} AS month_start, ${end} AS month_end
    )
  `;
};
exports.buildMonthRangeCTE = buildMonthRangeCTE;
const getDayRangeSqlKST = (y, m, d) => {
    return {
        start: (0, drizzle_orm_1.sql) `make_timestamptz(${y}, ${m}, ${d}, 0, 0, 0, 'Asia/Seoul')`,
        end: (0, drizzle_orm_1.sql) `(make_timestamptz(${y}, ${m}, ${d}, 0, 0, 0, 'Asia/Seoul') + interval '1 day')`,
    };
};
exports.getDayRangeSqlKST = getDayRangeSqlKST;
const buildDayRangeCTE = (y, m, d) => {
    const { start, end } = (0, exports.getDayRangeSqlKST)(y, m, d);
    return (0, drizzle_orm_1.sql) `
    WITH day_range AS (
      SELECT ${start} AS day_start, ${end} AS day_end
    )
  `;
};
exports.buildDayRangeCTE = buildDayRangeCTE;
//# sourceMappingURL=date.util.js.map