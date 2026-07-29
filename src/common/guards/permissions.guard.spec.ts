import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const buildContext = (user?: { permissions: string[] }): ExecutionContext => {
    return {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('allows the request when no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(buildContext({ permissions: [] }))).toBe(true);
  });

  it('denies the request when the user is missing one of the required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['create_user', 'delete_user']);
    expect(guard.canActivate(buildContext({ permissions: ['create_user'] }))).toBe(false);
  });

  it('allows the request when the user has every required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['create_user']);
    expect(
      guard.canActivate(buildContext({ permissions: ['create_user', 'view_dashboard'] })),
    ).toBe(true);
  });

  it('denies the request when there is no authenticated user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['create_user']);
    expect(guard.canActivate(buildContext(undefined))).toBe(false);
  });
});
