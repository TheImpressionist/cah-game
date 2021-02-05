import { RoomUser } from '../../Room/RoomUser';
import { CardService } from '../../Cards/CardService';
import { Game } from '../Game';
import { IGameConfig } from '../IGameConfig';
import { GameEvents } from '../GameEvents';

describe('Game', () => {
  const cardService = new CardService();

  describe('Basic game', () => {
    it('Starts game, hands out cards, notifies of round start, and lets you play a basic game allowing for each player to play once', async () => {
      const config: IGameConfig = {
        pickTimer: 2000,
        roundTimer: 5000,
        maxPoints: 2,
        packs: [0],
        maxPlayers: 6,
      };
      const users = [
        {
          userID: '0',
          spectator: false,
          cards: null,
        },
        {
          userID: '1',
          spectator: false,
          cards: null,
        },
      ];
      const expectedEvents = [
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.ROUND_ENDED,
        GameEvents.PICK_STARTED,
        GameEvents.PICK_ENDED,
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.ROUND_ENDED,
        GameEvents.PICK_STARTED,
        GameEvents.PICK_ENDED,
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.ROUND_ENDED,
        GameEvents.PICK_STARTED,
        GameEvents.PICK_ENDED,
        GameEvents.GAME_ENDED,
      ];
      const game = new Game(
        (users as unknown) as Array<RoomUser>,
        config,
        cardService,
      );

      // A hacky way to override static values
      (Game as any).TIMER_BETWEEN_ROUNDS = 0;

      const gamePromise = new Promise<Array<any>>((resolve) => {
        const actionsTaken = [];

        game.subscribe((event, data: any) => {
          if (event === GameEvents.HAND_OUT_CARDS) {
            users.forEach((user) => {
              user.cards = data[user.userID];
            });
          }

          if (event === GameEvents.ROUND_STARTED) {
            setTimeout(() => {
              const player = users.find(
                ({ userID }) => data.cardCzar !== userID,
              );

              game.playCard(player.userID, player.cards[0].text);
            }, 0);
          }

          if (event === GameEvents.PICK_STARTED) {
            setTimeout(() => {
              const { playedCards } = actionsTaken[
                actionsTaken.length - 1
              ].data;

              game.pickCard(playedCards[0]);
            }, 0);
          }

          setTimeout(
            () =>
              actionsTaken.push({
                event,
                data,
              }),
            0,
          );

          if (event === GameEvents.GAME_ENDED) {
            setTimeout(() => resolve(actionsTaken), 0);
          }
        });
        game.startRound();
      });

      const actionsTaken = await gamePromise;
      const cardHandoutActions = actionsTaken.filter(
        ({ event }) => event === GameEvents.HAND_OUT_CARDS,
      );

      expect(actionsTaken).toHaveLength(16);
      expect(actionsTaken.map(({ event }) => event)).toStrictEqual(
        expectedEvents,
      );

      cardHandoutActions.forEach((action) => {
        expect(Object.keys(action.data)).toStrictEqual(['0', '1']);
        expect(action.data['0']).toHaveLength(6);
        expect(action.data['1']).toHaveLength(6);
      });
    });
  });

  // Test nextCzar leave
  // Test czar leave
  // test too few players
  // test no card picked
});
