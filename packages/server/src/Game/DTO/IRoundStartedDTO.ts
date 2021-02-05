import { IBlackCard } from '../../Cards/ICard';

export interface IRoundStartedDTO {
  cardCzar: string;
  blackCard: IBlackCard;
  roundTimer: number;
}
