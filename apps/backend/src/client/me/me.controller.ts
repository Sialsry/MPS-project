import { Controller, Get, Req, UseGuards,Body, Patch, UseInterceptors, UploadedFile, Post  } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { MeService } from './me.service';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { MeResponseDto, SubscriptionDto } from './dto/me.response.dto';
import { UpdateProfileDto } from './dto/update-me.dto';
import { existsSync, mkdirSync } from 'fs';
import { SubscribeDto } from './dto/subscribe.dto';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'profile');
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async overview(@Req() req) {
    const payload = await this.me.getMe(Number(req.user.sub));
  
    console.debug('[RESP /me/overview]', JSON.stringify(payload, (_k, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));
  
    return payload;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('profile_image', {   // ← 프론트에서 이 필드명으로 파일 보냄
    storage: diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => {
        const ext = (file.originalname.match(/\.[^\.]+$/)?.[0] ?? '').toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async updateProfile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UpdateProfileDto,                
  ) {
    const companyId = Number(req.user.sub);

    
    if (file) {
      dto.profile_image_url = `/uploads/profile/${file.filename}`; 
    }

    return this.me.updateProfile(companyId, dto); 
  }
  @Post('subscribe')
  async subscribe(@Req() req, @Body() dto: SubscribeDto) {
    const companyId = Number(req.user.sub);
    return this.me.subscribe(companyId, dto);
  }

  @Get('history')
  async history(@Req() req: any) {
    const companyId: number = req.user.sub;
    return this.me.getHistory(companyId);
  }
}
//   @Post('subscription-settings')
//   async updateSubscriptionSettings(@Req() req, @Body() dto: UpdateSubscriptionSettingsDto) {
//     const companyId = Number(req.user.sub);
//     return this.me.updateSubscriptionSettings(companyId, dto);
//   }

//   // ▼ 추가: API 키 재발급 (평문 1회 반환)
//   @Post('rotate-api-key')
//   async rotateApiKey(@Req() req) {
//     const companyId = Number(req.user.sub);
//     return this.me.rotateApiKey(companyId, /* userId(optional) */ null);
//   }

