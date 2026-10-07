import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên khách hàng' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'nguyenvana@gmail.com', description: 'Địa chỉ email' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Địa chỉ email không đúng định dạng' })
  email: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại liên hệ' })
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: 'Số điện thoại Việt Nam không hợp lệ' })
  phone: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu bảo mật' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;
}
