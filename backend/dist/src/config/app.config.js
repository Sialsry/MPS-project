"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_CONFIG = void 0;
exports.APP_CONFIG = {
    TIMEZONE: process.env.APP_TIMEZONE || 'Asia/Seoul',
    REVENUE: {
        DEFAULT_START_YEAR: parseInt(process.env.REVENUE_DEFAULT_START_YEAR || '2024'),
        DEFAULT_MONTHS: parseInt(process.env.REVENUE_DEFAULT_MONTHS || '15'),
        MAX_MONTHS: parseInt(process.env.REVENUE_MAX_MONTHS || '24'),
        YEARS: (process.env.REVENUE_YEARS || '2024,2025').split(',').map(Number),
    },
    SUBSCRIPTION: {
        PRICES: {
            STANDARD: parseInt(process.env.SUBSCRIPTION_PRICE_STANDARD || '500000'),
            BUSINESS: parseInt(process.env.SUBSCRIPTION_PRICE_BUSINESS || '1200000'),
            FREE: 0,
        },
        DISCOUNT_RANGES: {
            STANDARD: {
                MIN: parseFloat(process.env.SUBSCRIPTION_DISCOUNT_STANDARD_MIN || '0.08'),
                MAX: parseFloat(process.env.SUBSCRIPTION_DISCOUNT_STANDARD_MAX || '0.23'),
            },
            BUSINESS: {
                MIN: parseFloat(process.env.SUBSCRIPTION_DISCOUNT_BUSINESS_MIN || '0.10'),
                MAX: parseFloat(process.env.SUBSCRIPTION_DISCOUNT_BUSINESS_MAX || '0.30'),
            },
        },
    },
};
//# sourceMappingURL=app.config.js.map