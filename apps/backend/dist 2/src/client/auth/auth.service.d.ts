import { JwtService } from '@nestjs/jwt';
import { CompaniesService } from '../companies/companies.service';
export declare class AuthService {
    private readonly companies;
    private readonly jwt;
    constructor(companies: CompaniesService, jwt: JwtService);
    validate(email: string, password: string): Promise<{
        id: number;
        name: string;
        email: string;
        grade: "free" | "standard" | "business";
        profile_image_url: string | null;
        subscriptionStatus: "free" | "active" | "expired" | "scheduled";
        subscriptionTier: any;
        subscriptionEndsAt: any;
    } | null>;
    login(email: string, password: string): Promise<{
        tokenType: string;
        accessToken: string;
        expiresIn: number;
        company: {
            id: number;
            name: string;
            email: string;
            grade: "free" | "standard" | "business";
            profile_image_url: string | null;
            subscriptionStatus: "free" | "active" | "expired" | "scheduled";
        };
    }>;
}
