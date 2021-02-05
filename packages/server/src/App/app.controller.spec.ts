import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/User/UserService';
import { AppController } from './AppController';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [UserService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('createUser', () => {
    it('Sucks', () => {
      //
    });
  });
});
