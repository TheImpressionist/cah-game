import { Injectable } from '@nestjs/common';
import * as cah from './cah-cards-compact.json';
import { IPack } from './IPack';

@Injectable()
export class CardService {
  private deck: Array<IPack> | null = null;

  constructor() {
    this.hydrateCards();
  }

  public getDeck(packs?: Array<number>): Array<IPack> {
    if (!packs || !packs.length) {
      return JSON.parse(JSON.stringify(this.deck));
    }

    return JSON.parse(
      JSON.stringify(this.deck.filter((_, index) => packs.includes(index))),
    );
  }

  private hydrateCards() {
    this.deck = cah.packs
      .filter(({ official }) => official)
      .map((pack, packIndex) => ({
        ...pack,
        white: pack.white.map((cardIndex) => ({
          text: cah.white[cardIndex],
          pack: packIndex,
        })),
        black: pack.black.map((cardIndex) => ({
          ...cah.black[cardIndex],
          pack: packIndex,
        })),
      }));
  }
}
