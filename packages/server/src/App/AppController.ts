import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from './DTO/CreateUserDTO';
import { CreateUserResponseDTO } from '../User/DTO/CreateUserResponseDTO';
import { UserService } from '../User/UserService';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @Post('/create-user')
  createUser(@Body() createUserDTO: CreateUserDTO): CreateUserResponseDTO {
    if (!createUserDTO.name) {
      // throw new NameRequiredError();
    }

    return this.userService.createUser(createUserDTO.name);
  }
}
