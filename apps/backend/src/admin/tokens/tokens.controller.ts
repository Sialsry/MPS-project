import { Controller, Get, Query, Param } from '@nestjs/common'
import { TokensService } from './tokens.service'
import { TokenInfoDto, WalletInfoDto, DailyBatchesDto, BatchDetailDto } from './dto/tokens.dto'

@Controller('admin/tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('info')
  async getTokenInfo() {
    return this.tokensService.getTokenInfo()
  }

  @Get('wallet')
  async getWalletInfo() {
    return this.tokensService.getWalletInfo()
  }

  @Get('batches')
  async getDailyBatches(@Query() query: DailyBatchesDto) {
    return this.tokensService.getDailyBatches(query)
  }

  @Get('batches/:date')
  async getBatchDetail(@Param('date') date: string) {
    return this.tokensService.getBatchDetail({ date })
  }
}
