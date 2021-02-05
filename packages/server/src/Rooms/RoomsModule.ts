import { Module } from '@nestjs/common';
import { CardModule } from '../Cards/CardModule';
import { RoomGateway } from './RoomGateway';
import { RoomService } from './RoomService';

@Module({
  imports: [CardModule],
  providers: [RoomService, RoomGateway],
  exports: [RoomService],
})
export class RoomsModule {}
