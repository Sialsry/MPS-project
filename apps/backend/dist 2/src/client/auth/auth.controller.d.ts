import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CompaniesService } from '../companies/companies.service';
export declare class AuthController {
    private readonly auth;
    private readonly companies;
    constructor(auth: AuthService, companies: CompaniesService);
    login(dto: LoginDto, res: Response): Promise<{
        ok: boolean;
        company: {
            id: number;
            name: string;
            email: string;
            grade: "free" | "standard" | "business";
            profile_image_url: string | null;
            subscriptionStatus: "free" | "active" | "expired" | "scheduled";
        };
        tokenType: string;
        expiresIn: number;
    }>;
    logout(res: Response): Promise<void>;
    me(req: Request): Promise<any>;
}
