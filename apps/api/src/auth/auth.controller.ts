import { Controller, Post, Body, UseGuards, Get, Req, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(@Req() req: any, @Body() _: LoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(200)
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
    return { message: 'ok' };
  }

  @Get('me')
  me(@CurrentUser() user: any) {
    return user;
  }
}
