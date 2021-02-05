import { Socket } from 'socket.io';

export class RoomUser {
  constructor(
    public readonly userID: string,
    public readonly spectator: boolean,
    public readonly socket: Socket,
  ) {}
}
