import { RoomUser } from '../Room/RoomUser';
import { CardService } from '../Cards/CardService';
import { GameDeck } from '../Game/GameDeck';
import { Player } from './Player';
import { IGameConfig } from './IGameConfig';
import { IGameSummary } from './IGameSummary';
import { IObservable, ObservableHandler } from '../Observable/IObservable';
import { GameEvents } from './GameEvents';

export class Game implements IObservable {
  private static readonly TIMER_BETWEEN_ROUNDS = 5000;
  private static readonly MAX_CARDS = 6;
  private static readonly MIN_PLAYERS = 2;

  private listeners: Array<any> = [];
  private players: Array<Player> | null = null;
  private deck: GameDeck | null = null;
  private cardCzar: string | null = null;
  private nextCzar: string | null = null;
  private startTimer: NodeJS.Timeout | null = null;
  private roundTimer: NodeJS.Timeout | null = null;
  private pickTimer: NodeJS.Timeout | null = null;
  private round = 0;

  constructor(
    roomUsers: Array<RoomUser>,
    private readonly config: IGameConfig,
    private readonly cardService: CardService,
  ) {
    // Validate too few players
    this.players = roomUsers
      .filter(({ spectator }) => !spectator)
      .map(({ userID }) => new Player(userID));
    this.deck = new GameDeck(this.cardService.getDeck(this.config.packs));
  }

  public subscribe(handler: ObservableHandler): void {
    this.listeners.push(handler);
  }

  public getGameSummary(): IGameSummary {
    // TODO: show card packs
    return {
      playerCount: this.players.length,
      createdAt: new Date(),
      roundsPlayed: this.round,
      scores: this.players.reduce((accumulator, player) => {
        accumulator[player.userID] = player.getPoints();

        return accumulator;
      }, {}),
    };
  }

  public removePlayer(userID: string): void {
    if (this.players.length < Game.MIN_PLAYERS) {
      clearTimeout(this.startTimer);
      clearTimeout(this.roundTimer);
      clearTimeout(this.pickTimer);
      // Perhaps let users know of the reason it ended
      this.listeners.forEach((listener) =>
        listener(GameEvents.GAME_ENDED, { summary: this.getGameSummary() }),
      );
      return;
    }

    if (userID === this.nextCzar) {
      this.prepareNextCardCzar();
    }

    if (this.cardCzar === userID) {
      this.players = this.players.filter((player) => player.userID !== userID);
      this.endRound();
      this.endPickTimer();
    }
  }

  public playCard(userID: string, card: string): void {
    const player = this.players.find(
      ({ userID: playerID }) => playerID === userID,
    );

    player?.playCard(card);

    this.listeners.forEach((listener) =>
      listener(GameEvents.PLAYER_CARD_PLAYED, {
        userID,
      }),
    );

    if (this.allUsersPlayedCards()) {
      this.endRound();
    }
  }

  public pickCard(card: string) {
    const cardCzar = this.players.find(
      ({ userID }) => userID === this.cardCzar,
    );
    const winningPlayer = this.players.find(
      (player) => player.getCardInPlay() === card,
    );

    cardCzar?.pickCard(card);
    winningPlayer?.addPoint();
    this.endPickTimer();
  }

  public startRound(): void {
    if (!this.round) {
      this.listeners.forEach((listener) => listener(GameEvents.GAME_STARTED));
    }

    this.round += 1;
    const blackCard = this.deck.getBlackCard();

    if (blackCard === undefined) {
      // end game
      // notify
      return;
    }

    this.pickCardCzar();
    this.handOutCards();
    this.listeners.forEach((listener) =>
      listener(GameEvents.ROUND_STARTED, {
        blackCard,
        cardCzar: this.cardCzar,
        roundTimer: this.config.roundTimer,
      }),
    );
    this.roundTimer = setTimeout(() => this.endRound, this.config.roundTimer);
  }

  private pickCardCzar() {
    if (!this.nextCzar) {
      this.cardCzar = this.players[0].userID;
    } else {
      this.cardCzar = this.nextCzar;
    }

    this.prepareNextCardCzar();
  }

  private prepareNextCardCzar() {
    const prevCardCzarIndex = this.players.findIndex(
      ({ userID }) => userID === this.cardCzar,
    );
    const nextCzarIndex = prevCardCzarIndex + 1;
    const nextCzar = this.players[nextCzarIndex];

    if (nextCzar) {
      this.nextCzar = nextCzar.userID;
    } else {
      this.nextCzar = this.players[0].userID;
    }
  }

  private handOutCards(): void {
    for (const user of this.players) {
      const userCards = this.players[user.userID].getCards();
      const newCards = this.deck.getWhiteCards(
        Game.MAX_CARDS - userCards.length,
      );

      this.players[user.userID].addCards(newCards);
    }

    // Hand them out in the same listener as startRound?
    this.listeners.forEach((listener) =>
      listener(
        GameEvents.HAND_OUT_CARDS,
        this.players.reduce((accumulator, player) => {
          accumulator[player.userID] = player.getCards();

          return accumulator;
        }, {}),
      ),
    );
  }

  private endRound(): void {
    clearTimeout(this.roundTimer);

    const playedCards = this.players
      .filter(({ userID }) => userID !== this.cardCzar)
      .map((player) => {
        return player.getCardInPlay();
      });
    this.listeners.forEach((listener) =>
      listener(GameEvents.ROUND_ENDED, {
        playedCards,
      }),
    );
    this.startPickTimer();
  }

  private startPickTimer(): void {
    this.pickTimer = setTimeout(() => this.endPickTimer, this.config.pickTimer);
    this.listeners.forEach((listener) =>
      listener(GameEvents.PICK_STARTED, {
        pickTimer: this.config.pickTimer,
      }),
    );
  }

  private endPickTimer(): void {
    clearTimeout(this.pickTimer);
    this.postRoundHandler();
  }

  private postRoundHandler(): void {
    const cardCzar = this.players.find(
      ({ userID }) => userID === this.cardCzar,
    );
    const winningPlayer = this.players.find(
      (player) => cardCzar.getCardPick() === player.getCardInPlay(),
    );

    this.listeners.forEach((listener) =>
      listener(GameEvents.PICK_ENDED, {
        userID: winningPlayer?.userID ?? null,
        winningCard: winningPlayer?.getCardInPlay() ?? null,
      }),
    );

    if (this.playerReachedMaxPoints()) {
      this.listeners.forEach((listener) =>
        listener(GameEvents.GAME_ENDED, {
          summary: this.getGameSummary(),
        }),
      );
      return;
    }

    this.players.forEach((player) => player.clearCardInPlay());
    this.startTimer = setTimeout(
      () => this.startRound(),
      Game.TIMER_BETWEEN_ROUNDS,
    );
  }

  private playerReachedMaxPoints(): boolean {
    return (
      this.players.find(
        (player) => player.getPoints() === this.config.maxPoints,
      ) !== undefined
    );
  }

  private allUsersPlayedCards(): boolean {
    return (
      this.players
        .filter(({ userID }) => userID !== this.cardCzar)
        .find((player) => !!player.getCardInPlay()) !== undefined
    );
  }
}
