import { Module } from '@nestjs/common';
import { AppController } from './AppController';
import { RoomsModule } from '../Rooms/RoomsModule';

@Module({
  imports: [RoomsModule],
  controllers: [AppController],
})
export class AppModule {}
