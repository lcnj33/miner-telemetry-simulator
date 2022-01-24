import { Module } from '@nestjs/common';
import { ReporterModule } from '../reporter/reporter.module';
import { ProcessorController } from './processor.controller';
import { ProcessorService } from './processor.service';

@Module({
  imports: [ReporterModule],
  controllers: [ProcessorController],
  providers: [ProcessorService],
})
export class ProcessorModule {}
