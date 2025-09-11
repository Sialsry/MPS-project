import { Strategy as JwtStrategyBase } from 'passport-jwt';
type JwtPayload = {
    sub: number;
    grade: string;
    name?: string;
    email?: string;
    profile_image_url?: string | null;
    subscriptionStatus?: string | null;
    iat?: number;
    exp?: number;
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => JwtStrategyBase & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
