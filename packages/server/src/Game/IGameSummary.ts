export interface IGameSummary {
  playerCount: number;
  roundsPlayed: number;
  scores: Record<string, number>;
  createdAt: Date;
}
