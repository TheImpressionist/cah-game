import { IWhiteCard } from '../Cards/ICard';
import { CardNotFoundError } from './CardNotFoundError';

export class Player {
  private cardInPlay: string | null = null;
  private cardPick: string | null = null;
  private cards: Array<IWhiteCard> | null = [];
  private playedCards: Array<IWhiteCard> = [];
  private points = 0;

  constructor(public readonly userID: string) {}

  public getCards(): Array<IWhiteCard> | null {
    return this.cards;
  }

  public addCards(cards: Array<IWhiteCard>): void {
    this.cards = [...this.cards, ...cards];
  }

  public playCard(text: string): void {
    const card = this.cards.find((card) => card.text === text);

    if (!card) {
      throw new CardNotFoundError();
    }
    this.cardInPlay = card.text;
  }

  public pickCard(text: string): void {
    this.cardPick = text;
  }

  public getCardPick(): string {
    return this.cardPick;
  }

  public getCardInPlay(): string {
    return this.cardInPlay;
  }

  public clearCardInPlay(): void {
    if (!this.cardInPlay) {
      // TODO: throw error no card in play
    }

    // this.playedCards = [...this.playedCards, this.cardInPlay];
    this.cards = this.cards.filter((card) => card.text !== this.cardInPlay);
    this.cardInPlay = null;
  }

  public getPoints(): number {
    return this.points;
  }

  public addPoint(): void {
    this.points += 1;
  }
}
