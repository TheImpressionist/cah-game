import shuffle from 'lodash.shuffle';
import { IBlackCard, IWhiteCard } from 'src/Cards/ICard';
import { IPack } from '../Cards/IPack';

export class GameDeck {
  private whiteCards: Array<IWhiteCard> | null = null;
  private blackCards: Array<IBlackCard> | null = null;

  constructor(deck: Array<IPack>) {
    this.mapWhiteCards(deck);
    this.mapBlackCards(deck);
  }

  public getWhiteCards(count: number): Array<IWhiteCard> {
    return this.whiteCards.splice(0, count);
  }

  public getBlackCard(): IBlackCard {
    return this.blackCards.shift();
  }

  public listWhiteCards(): Array<IWhiteCard> {
    return this.whiteCards.slice();
  }

  public listBlackCards(): Array<IBlackCard> {
    return this.blackCards.slice();
  }

  private mapWhiteCards(deck: Array<IPack>): void {
    this.whiteCards = shuffle(
      deck.reduce((accumulator, pack) => {
        accumulator = [...accumulator, ...pack.white];

        return accumulator;
      }, []),
    );
  }

  private mapBlackCards(deck: Array<IPack>): void {
    this.blackCards = shuffle(
      deck.reduce((accumulator, pack) => {
        accumulator = [...accumulator, ...pack.black];

        return accumulator;
      }, []),
    );
  }
}
