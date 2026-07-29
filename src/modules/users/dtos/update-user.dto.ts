import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Set to false to deactivate the user (blocks login).',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
