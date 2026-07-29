import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'MANAGER' })
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]*$/, { message: 'name must be UPPER_SNAKE_CASE, e.g. MANAGER' })
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Can manage products and view the dashboard' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
