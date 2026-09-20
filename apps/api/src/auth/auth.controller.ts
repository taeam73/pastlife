import { Body, Controller, Delete, Get, Headers, HttpCode, Inject, Param, Post, UnauthorizedException } from '@nestjs/common';
import { GoogleExchangeRequestSchema } from '@pastlife/contracts';
import { AuthService } from './auth.service.js';
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  @Post('google/exchange') exchange(@Body() body: unknown) { const input = GoogleExchangeRequestSchema.parse(body); return this.auth.exchange(input.idToken); }
  @Post('archive/:resultId') archive(@Param('resultId') resultId: string, @Headers('authorization') auth: string | undefined) { return this.auth.archive(resultId, this.token(auth)); }
  @Get('archive') list(@Headers('authorization') auth: string | undefined) { return this.auth.list(this.token(auth)); }
  @Get('archive/:resultId') detail(@Param('resultId') resultId: string, @Headers('authorization') auth: string | undefined) { return this.auth.detail(resultId, this.token(auth)); }
  @Delete('archive/:resultId')
  @HttpCode(204)
  async deleteArchive(@Param('resultId') resultId: string, @Headers('authorization') auth: string | undefined) { await this.auth.deleteArchive(resultId, this.token(auth)); }
  private token(value?: string) { if (!value?.startsWith('Bearer ') || value.length <= 7) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Bearer token required' }); return value.slice(7); }
}
