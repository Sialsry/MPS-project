import { Injectable, UnauthorizedException } from '@nestjs/common'; // 클래스를 의존성 주입 가능한 프로바이더로 만들어주는 데코레이터
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable() 
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService, // 환경변수 읽어오는 서비스
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { adminId, adminPw } = loginDto;
    const Id = this.configService.get('ADMIN_ID');
    const Pw = this.configService.get('ADMIN_PW');

    if (adminId !== Id || adminPw !== Pw) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT 토큰 생성
    const payload = { adminId };
    const accessToken = this.jwtService.sign(payload, {expiresIn: '1h'});
    const refreshToken = this.jwtService.sign(payload, {expiresIn: '7d'});

    return { accessToken, refreshToken, adminId };
  }
}

// 실제 비즈니스 로직을 담고있는 프로바이더. 컨트롤러에서 요청을 받아 처리하고 결과를 반환
// 프로바이더는 의존성주입을 통해 필요한 곳에 제공될 수 있는 모든 것
// 데이터베이스 연동, 비즈니스 로직, 외부 API 호출, 유효성 검사, 로깅, 트랜잭션 관리 등87956rt4SZgfhtfyiujyh8