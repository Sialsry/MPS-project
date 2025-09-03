// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategyBase, ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';

function fromCookie(req: Request) {
  return req?.cookies?.['mps_at'] ?? null;
}

type JwtPayload = {
  sub: number;            // 숫자로 두는 걸 권장
  grade: string;
  name?: string;
  email?: string;
  profile_image_url?: string | null;
  subscriptionStatus?: string | null;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookie,                              
        ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ]),
      secretOrKey: process.env.JWT_SECRET!,       
      issuer: 'mps',
      audience: 'mps-client',
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    return payload; // req.user 로 그대로 전달
  }
}
