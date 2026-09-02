import { plainToInstance } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @IsString()
  POSTGRES_HOST?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(65535)
  POSTGRES_PORT?: number;

  @IsOptional()
  @IsString()
  POSTGRES_USER?: string;

  @IsOptional()
  @IsString()
  POSTGRES_PASSWORD?: string;

  @IsOptional()
  @IsString()
  POSTGRES_DB?: string;

  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  @IsOptional()
  @IsString()
  JWT_PRIVATE_KEY?: string;

  @IsOptional()
  @IsString()
  JWT_PUBLIC_KEY?: string;

  @IsOptional()
  @IsString()
  REFRESH_SECRET?: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  RABBITMQ_URL?: string;
}

/**
 * Fails application boot fast when required configuration is missing or
 * malformed, and enforces that either a JWT_SECRET (HS256) or an RSA
 * key pair (RS256) is present.
 */
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  const hasSecret = !!validatedConfig.JWT_SECRET;
  const hasKeyPair = !!validatedConfig.JWT_PRIVATE_KEY && !!validatedConfig.JWT_PUBLIC_KEY;

  if (!hasSecret && !hasKeyPair) {
    throw new Error(
      'Environment validation failed: provide either JWT_SECRET or both JWT_PRIVATE_KEY/JWT_PUBLIC_KEY.',
    );
  }

  return validatedConfig;
}
