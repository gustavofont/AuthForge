import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class InvalidCredentialsException extends AppException {
  constructor() {
    super('Invalid email or password.', HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }
}

export class AccountLockedException extends AppException {
  constructor(retryAfterMinutes: number) {
    super(
      `Account temporarily locked due to too many failed login attempts. Try again in ${retryAfterMinutes} minute(s).`,
      HttpStatus.FORBIDDEN,
      'ACCOUNT_LOCKED',
    );
  }
}

export class AccountInactiveException extends AppException {
  constructor() {
    super('This account is inactive.', HttpStatus.FORBIDDEN, 'ACCOUNT_INACTIVE');
  }
}

export class UserNotFoundException extends AppException {
  constructor() {
    super('User not found.', HttpStatus.NOT_FOUND, 'USER_NOT_FOUND');
  }
}

export class UserAlreadyExistsException extends AppException {
  constructor() {
    super('A user with this email already exists.', HttpStatus.CONFLICT, 'USER_ALREADY_EXISTS');
  }
}

export class InvalidRefreshTokenException extends AppException {
  constructor() {
    super('Invalid or expired refresh token.', HttpStatus.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
  }
}

export class SessionNotFoundException extends AppException {
  constructor() {
    super('Session not found.', HttpStatus.NOT_FOUND, 'SESSION_NOT_FOUND');
  }
}

export class InvalidResetTokenException extends AppException {
  constructor() {
    super(
      'Invalid or expired password reset token.',
      HttpStatus.BAD_REQUEST,
      'INVALID_RESET_TOKEN',
    );
  }
}

export class InvalidCurrentPasswordException extends AppException {
  constructor() {
    super('Current password is incorrect.', HttpStatus.BAD_REQUEST, 'INVALID_CURRENT_PASSWORD');
  }
}

export class RoleNotFoundException extends AppException {
  constructor() {
    super('Role not found.', HttpStatus.NOT_FOUND, 'ROLE_NOT_FOUND');
  }
}

export class RoleAlreadyExistsException extends AppException {
  constructor() {
    super('A role with this name already exists.', HttpStatus.CONFLICT, 'ROLE_ALREADY_EXISTS');
  }
}

export class PermissionNotFoundException extends AppException {
  constructor() {
    super('Permission not found.', HttpStatus.NOT_FOUND, 'PERMISSION_NOT_FOUND');
  }
}

export class PermissionAlreadyExistsException extends AppException {
  constructor() {
    super(
      'A permission with this name already exists.',
      HttpStatus.CONFLICT,
      'PERMISSION_ALREADY_EXISTS',
    );
  }
}

export class RoleAlreadyAssignedException extends AppException {
  constructor() {
    super(
      'This role is already assigned to the user.',
      HttpStatus.CONFLICT,
      'ROLE_ALREADY_ASSIGNED',
    );
  }
}

export class PermissionAlreadyAssignedException extends AppException {
  constructor() {
    super(
      'This permission is already assigned to the role.',
      HttpStatus.CONFLICT,
      'PERMISSION_ALREADY_ASSIGNED',
    );
  }
}
