import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
export declare class AuthService {
    private jwtService;
    private configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    logout(authHeader: string): Promise<{
        message: string;
    }>;
    refreshToken(authHeader: string): Promise<LoginResponseDto>;
}
