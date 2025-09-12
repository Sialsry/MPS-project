import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    logout(authHeader: string): Promise<{
        message: string;
    }>;
    refreshToken(authHeader: string): Promise<LoginResponseDto>;
}
