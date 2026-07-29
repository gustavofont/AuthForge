import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  device!: string | null;

  @ApiPropertyOptional()
  ip!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  expiresAt!: Date;
}
