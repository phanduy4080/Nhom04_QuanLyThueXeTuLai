import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth (Xác Thực & Phân Quyền)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản khách hàng mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Đăng ký tài khoản thành công',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hệ thống (Admin, Staff, Customer)' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  async getProfile(@CurrentUser('publicId') publicId: string) {
    const result = await this.authService.getProfile(publicId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin tài khoản thành công',
      data: result,
    };
  }
}
