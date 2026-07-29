import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'create_product', description: 'snake_case permission identifier' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'name must be snake_case, e.g. create_product' })
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Allows creating new products' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
