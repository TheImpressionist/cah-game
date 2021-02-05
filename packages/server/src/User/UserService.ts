import { Injectable } from '@nestjs/common';
import { User } from './User';
import { CreateUserResponseDTO } from './DTO/CreateUserResponseDTO';
import { AuthService } from '../AuthService/AuthService';
import { NameTakenError } from './NameTakenError';

@Injectable()
export class UserService {
  private readonly users = new Map<string, User>();

  constructor(private readonly authService: AuthService) {}

  public createUser(name: string): CreateUserResponseDTO {
    if (this.isUserNameTaken(name)) {
      throw new NameTakenError();
    }

    const user = new User(name);
    const token = this.authService.issueToken(user);

    this.users.set(user.id, user);

    return new CreateUserResponseDTO(user, token);
  }

  public getUser(id: string): User {
    return this.users.get(id);
  }

  public removeUser(id: string): void {
    this.users.delete(id);
  }

  private isUserNameTaken(name: string): boolean {
    return (
      Array.from(this.users.values()).find((user) => user.name === name) !==
      undefined
    );
  }
}
