import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DataSource } from 'typeorm';
import { Get, Query, Param } from '@nestjs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('student-photo/:filename')
  async getPhoto(@Param('filename') filename: string, @Res() res: any) {
    const https = require('https');
    const url = `https://ictcomputereducation.com/uploads/${filename}`;

    https
      .get(url, (response: any) => {
        if (response.statusCode === 200) {
          res.setHeader(
            'Content-Type',
            response.headers['content-type'] || 'image/jpeg',
          );
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Access-Control-Allow-Origin', '*');
          response.pipe(res);
        } else {
          res.status(404).send('Image not found');
        }
      })
      .on('error', () => {
        res.status(500).send('Proxy error');
      });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user and return JWT tokens.',
  })
  @ApiResponse({ status: 200, description: 'Successful login.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const result = await this.authService.login(loginDto, ip);

      // Set secure HttpOnly cookie for web clients
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return {
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
          available_modules: result.available_modules,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[LOGIN FATAL ERROR]', error.message, error.stack);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Logout',
    description: 'Logout user and clear session/cookies.',
  })
  @ApiResponse({ status: 200, description: 'Successful logout.' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (req.user && req.user.sessionId) {
      await this.authService.logout(req.user.sessionId);
    }
    res.clearCookie('refresh_token');
    return {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout All Devices',
    description: 'Invalidates all active sessions for the user.',
  })
  async logoutAll(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (req.user && req.user.userId) {
      await this.authService.logoutAllDevices(req.user.userId);
    }
    res.clearCookie('refresh_token');
    return {
      success: true,
      message: 'Logged out from all devices successfully',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Exchange a valid refresh token for a new access token.',
  })
  @ApiResponse({ status: 200, description: 'Successful refresh.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  async refresh(
    @Body('refreshToken') bodyToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      bodyToken || (req.cookies as Record<string, string>)['refresh_token'];
    if (!token) throw new UnauthorizedException('Refresh token missing');

    const result = await this.authService.refresh(token);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
      timestamp: new Date().toISOString(),
    };
  }
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Request a password reset token via email.',
  })
  async forgotPassword(@Body('email') email: string, @Req() req: any) {
    if (!email) throw new UnauthorizedException('Email is required');
    await this.authService.forgotPassword(email, req.franchiseId);
    return {
      success: true,
      message: 'If an account exists, a reset link has been sent',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Reset password using a valid token.',
  })
  async resetPassword(@Body() body: any) {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      throw new UnauthorizedException('Token and newPassword are required');
    }
    await this.authService.resetPassword(token, newPassword);
    return { success: true, message: 'Password reset successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Current User Profile',
    description: 'Returns the profile details of the logged in user.',
  })
  async getMe(@Req() req: any) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const profile = await this.authService.getMe(
      req.user.userId,
      req.user.type || 'user',
    );
    return profile;
  }
}
