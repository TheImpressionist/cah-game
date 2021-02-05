import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { CardService } from '../Cards/CardService';
import { Room } from '../Room/Room';

@Injectable()
export class RoomService {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly cardService: CardService) {}

  public listRooms(): IterableIterator<Room> {
    return this.rooms.values();
  }

  public getRoom(roomID: string): Room {
    return this.rooms.get(roomID);
  }

  public createRoom(userID: string, socket: Socket): Room {
    // Add optional cleanup fn when room needs to be deleted
    const room = new Room(userID, this.cardService, socket);

    this.rooms.set(room.roomID, room);

    return room;
  }

  public removeRoom(roomID: string): void {
    this.rooms.delete(roomID);
  }
}
