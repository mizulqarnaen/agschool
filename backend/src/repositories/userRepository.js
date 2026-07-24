import { JsonRepository } from './baseRepository.js';

export class UserRepository extends JsonRepository {
  constructor() {
    super('users.json');
  }

  getUsersWithoutPasswords() {
    const users = this.readAll();
    return users.map(({ password_hash, ...user }) => user);
  }
}

export const userRepository = new UserRepository();
