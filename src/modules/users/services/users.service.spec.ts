import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../../../common/exceptions/business.exceptions';
import { IUserRolesService } from '../../permissions/interfaces/user-roles-service.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<IUserRepository>;
  let userRolesService: jest.Mocked<IUserRolesService>;

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    passwordHash: 'hashed',
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    userRoles: [],
    ...overrides,
  });

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };
    userRolesService = {
      assignRoleToUser: jest.fn(),
      unassignRoleFromUser: jest.fn(),
      getRoleNamesForUser: jest.fn().mockResolvedValue([]),
      getPermissionNamesForUser: jest.fn().mockResolvedValue([]),
    };
    service = new UsersService(userRepository, userRolesService);
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'jane@example.com',
      name: 'Jane Doe',
      password: 'Str0ngPass',
    };

    it('creates a user when the email is not taken', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(buildUser());

      const result = await service.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email, name: dto.name }),
      );
      expect(result.email).toBe(dto.email);
    });

    it('throws when the email is already registered', async () => {
      userRepository.findByEmail.mockResolvedValue(buildUser());

      await expect(service.create(dto)).rejects.toThrow(UserAlreadyExistsException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('throws UserNotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow(UserNotFoundException);
    });

    it('returns the mapped user including role names', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      userRolesService.getRoleNamesForUser.mockResolvedValue(['ADMIN']);

      const result = await service.findById('user-1');

      expect(result.roles).toEqual(['ADMIN']);
    });
  });

  describe('update', () => {
    it('deactivates a user by setting isActive to false', async () => {
      const user = buildUser({ isActive: true });
      userRepository.findById.mockResolvedValue(user);
      userRepository.save.mockImplementation((u) => Promise.resolve(u));

      const result = await service.update('user-1', { isActive: false });

      expect(result.isActive).toBe(false);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  describe('softDelete', () => {
    it('throws when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(service.softDelete('missing')).rejects.toThrow(UserNotFoundException);
      expect(userRepository.softDelete).not.toHaveBeenCalled();
    });

    it('soft-deletes an existing user', async () => {
      userRepository.findById.mockResolvedValue(buildUser());
      await service.softDelete('user-1');
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-1');
    });
  });
});
