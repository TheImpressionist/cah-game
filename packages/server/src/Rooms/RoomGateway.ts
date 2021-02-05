import {
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
  WsResponse,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './RoomService';

@WebSocketGateway({ namespace: 'rooms' })
export class RoomGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly roomService: RoomService) {}

  handleConnection(client: Socket) {
    const existingRooms = Array.from(this.roomService.listRooms());

    client.to(client.id).emit('listRooms', {
      rooms: existingRooms.map((room) => {
        const gameSummary = room.getGame()?.getGameSummary();
        const userCount = room.listUsers().length;
        const playerCount = gameSummary?.playerCount;

        return {
          user: userCount,
          players: playerCount,
          round: gameSummary.roundsPlayed,
        };
      }),
    });
  }

  // add user guard
  @SubscribeMessage('createRoom')
  public createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): WsResponse<unknown> {
    const room = this.roomService.createRoom(data, client);

    return {
      event: 'roomCreated',
      data: {
        roomID: room.roomID,
      },
    };
  }

  @SubscribeMessage('joinRoom')
  public joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): WsResponse<unknown> {
    const room = this.roomService.getRoom(data.roomID);
    // get user shit here
    room.addUser(client.id, data.spectator, client);

    // return room data such as users, etc
    return {
      event: 'roomJoined',
      data: {
        roomID: room.roomID,
      },
    };
  }
}
