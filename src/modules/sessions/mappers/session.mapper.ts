import { Session } from '../entities/session.entity';
import { SessionResponseDto } from '../dtos/session-response.dto';

export class SessionMapper {
  static toResponseDto(session: Session): SessionResponseDto {
    return {
      id: session.id,
      device: session.device,
      ip: session.ip,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }
}
