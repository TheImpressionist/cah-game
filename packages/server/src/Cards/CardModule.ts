import { Module } from '@nestjs/common';
import { CardService } from 'src/Cards/CardService';

@Module({
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
