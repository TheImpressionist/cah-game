import { time } from 'uniqid';
import { RoomUser } from './RoomUser';
import { CardService } from '../Cards/CardService';
import { Game } from '../Game/Game';
import { IGameConfig } from '../Game/IGameConfig';
import { DefaultGameConfig } from '../Game/DefaultGameConfig';
import { Socket } from 'socket.io';
import { GameEvents } from '../Game/GameEvents';
import { IHandOutCardsDTO } from '../Game/DTO/IHandOutCardsDTO';
import { IRoundStartedDTO } from '../Game/DTO/IRoundStartedDTO';
import { RoomEvents } from './RoomEvents';

export class Room {
  public static MAX_CARDS = 6;

  public readonly roomID: string = time(this.roomOwner);
  private readonly socket: Socket;
  private readonly users: Array<RoomUser> = [];
  private game: Game | null = null;
  private gameConfig: IGameConfig = new DefaultGameConfig();

  constructor(
    private roomOwner: string,
    private readonly cardService: CardService,
    socket: Socket,
  ) {
    this.users.push(new RoomUser(roomOwner, false, socket));
    this.socket = socket.join(`room-${this.roomID}`);
    this.handleIncomingRoomEvents();
    // Handle incoming room events
    // - config change
    // - potential chat
  }

  public listUsers(): Array<RoomUser> {
    return this.users;
  }

  public addUser(userID: string, spectator: boolean, socket: Socket): void {
    if (this.userExists(userID)) {
      // throw error users already exists
    }

    this.users.push(new RoomUser(userID, spectator, socket));
    // notify +1 player
  }

  public getUser(userID: string): RoomUser | undefined {
    return this.users.find((user) => user.userID === userID);
  }

  public removeUser(userID: string): void {
    if (this.users.length === 1) {
      // Cleanup socket listeners
      // Destroy room
    }

    if (userID === this.roomOwner) {
      const currentOwnerIndex = this.users.findIndex(
        ({ userID: roomUserID }) => roomUserID === userID,
      );
      const nextOwnerIndex = currentOwnerIndex + 1;
      this.roomOwner =
        this.users[nextOwnerIndex]?.userID ?? this.users[0].userID;
      // TODO: Notify of the new owner
    }

    if (this.game) {
      this.game.removePlayer(userID);
      // notify -1 played
    }
  }

  public getGameDetails(): any {
    if (!this.game) {
      // throw error no game started
    }

    // Show game data such as players score and config
    return this.game;
  }

  private startGame(): void {
    if (this.game) {
      // TODO: throw error that the game has started
    }

    this.game = new Game(this.users, this.gameConfig, this.cardService);
    this.game.subscribe((event: GameEvents, data: any) =>
      this.handleOutgoingGameEvents(event, data),
    );
    this.handleIncomingGameEvents();
    this.game.startRound();
  }

  private userExists(id: string): boolean {
    return this.users.find(({ userID }) => userID === id) !== undefined;
  }

  private handleIncomingRoomEvents(): void {
    this.socket.on(RoomEvents.CONFIG_UPDATE, (data) => {
      // validate if owner
      // update config [key]: value
    });
    this.socket.on(RoomEvents.START_GAME, () => {
      // validate if owner
      this.startGame();
    });
  }

  private handleIncomingGameEvents(): void {
    this.socket.on(GameEvents.PLAYER_CARD_PLAYED, (data) =>
      this.game.playCard(data.userID, data.card),
    );
    this.socket.on(GameEvents.PLAYED_CARD_PICK, (data) =>
      this.game.playCard(data.userID, data.card),
    );
  }

  private handleOutgoingGameEvents(event: GameEvents, data: any): void {
    switch (event) {
      case GameEvents.GAME_STARTED:
        return this.emitGameStarted();
      case GameEvents.HAND_OUT_CARDS:
        return this.emitCardsToPlayers(data);
      case GameEvents.ROUND_STARTED:
        return this.emitRoundStarted(data);
      case GameEvents.PLAYER_CARD_PLAYED:
        return this.emitCardPlayed();
      case GameEvents.ROUND_ENDED:
        return this.emitRoundEnded();
      case GameEvents.PICK_STARTED:
        return this.emitPickStarted();
      case GameEvents.PICK_ENDED:
        return this.emitPickEnded();
      case GameEvents.GAME_ENDED:
        return this.emitGameEnded();
      default:
        return;
    }
  }

  private emitGameStarted(): void {
    this.socket.emit(GameEvents.GAME_STARTED);
  }

  private emitCardsToPlayers(data: IHandOutCardsDTO): void {
    Object.entries(data).forEach(([userID, whiteCards]) => {
      const user = this.users.find((user) => user.userID === userID);

      if (!user) {
        return;
      }

      user.socket
        .to(user.socket.id)
        .emit(GameEvents.HAND_OUT_CARDS, { whiteCards });
    });
  }

  private emitRoundStarted(data: IRoundStartedDTO): void {
    this.socket.emit(GameEvents.ROUND_STARTED, data);
  }

  private emitCardPlayed(): void {
    // TODO: implement
  }

  private emitCardPicked(): void {
    // TODO: implement
  }

  private emitRoundEnded(): void {
    // TODO: implement
  }

  private emitPickStarted(): void {
    // TODO: implement
  }

  private emitPickEnded(): void {
    // TODO: implement
  }

  private emitGameEnded(): void {
    // TODO: implement
  }
}
