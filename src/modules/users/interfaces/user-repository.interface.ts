import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface FindAllUsersResult {
  items: User[];
  total: number;
}

export interface IUserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<FindAllUsersResult>;
  save(user: User): Promise<User>;
  softDelete(id: string): Promise<void>;
}
