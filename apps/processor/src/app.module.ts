import { Module } from '@nestjs/common';
import { ProcessorModule } from './processor/processor.module';

@Module({
  imports: [ProcessorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
