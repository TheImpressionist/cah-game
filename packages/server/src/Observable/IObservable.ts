export type ObservableHandler<T = unknown> = (event: string, data: T) => void;

export interface IObservable {
  subscribe(handler: ObservableHandler): void;
}
