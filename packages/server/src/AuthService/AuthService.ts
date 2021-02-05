import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../User/User';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public issueToken(user: User): string {
    return this.jwtService.sign(user);
  }

  public validateToken(token: string): User {
    return this.jwtService.decode(token) as User;
  }
}
