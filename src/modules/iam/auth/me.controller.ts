import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    type: string;
    role: string;
    franchiseId: number;
    username: string;
    sessionId: number;
  };
}

@ApiTags('Auth')
@Controller('me')
export class MeController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get Current User Profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile returned successfully.',
  })
  async getMe(@Req() req: RequestWithUser) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');
    return this.authService.getMe(req.user.userId, req.user.type);
  }
}
