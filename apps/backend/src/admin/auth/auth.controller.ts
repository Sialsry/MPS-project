import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('admin') // 이 컨트롤러의 모든 라우트(경로)에 기본적으로 /admin 접두사를 붙입니다.
export class AuthController {
  constructor(private readonly authService: AuthService) {} // 의존성 주입

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}



// HTTP 요청을 처리하는 관문 비즈니스로직을 직접 수행하지않고 요청을 받아 서비스에게 전달해주는 역할2