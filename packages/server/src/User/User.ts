import uniqid from 'uniqid';

export class User {
  public readonly id: string = uniqid();

  constructor(public readonly name: string) {}
}
