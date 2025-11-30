import { Controller, Post, Body, HttpCode, HttpStatus, ConflictException } from '@nestjs/common';
import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  employeeNumber: string;

  @IsEmail()
  @IsOptional()
  workEmail?: string;

  @IsEmail()
  @IsOptional()
  personalEmail?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        message: 'User registered successfully',
        user: {
          employeeProfileId: user.employeeProfileId,
          nationalId: user.nationalId,
          roles: user.roles,
        },
      };
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        throw new ConflictException('User with this national ID or employee number already exists');
      }
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.nationalId,
      loginDto.password,
    );
    return this.authService.login(user);
  }
}

