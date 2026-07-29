import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { SessionResponseDto } from '../dtos/session-response.dto';
import { ISessionsService, SESSIONS_SERVICE } from '../interfaces/sessions-service.interface';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(@Inject(SESSIONS_SERVICE) private readonly sessionsService: ISessionsService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated user's active sessions" })
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  listMine(@CurrentUser() user: AuthenticatedUser): Promise<SessionResponseDto[]> {
    return this.sessionsService.listActiveForUser(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a single session belonging to the authenticated user' })
  @ApiResponse({ status: 204, description: 'Session revoked.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.sessionsService.revokeForUserOrThrow(user.id, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke all sessions of the authenticated user (logout everywhere)' })
  @ApiResponse({ status: 204, description: 'All sessions revoked.' })
  async revokeAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.sessionsService.revokeAllForUser(user.id);
  }
}
