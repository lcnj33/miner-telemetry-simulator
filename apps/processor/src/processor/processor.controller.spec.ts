import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryMessage } from 'apps/consumer/src/poller/poller.interface';
import { ReporterService } from '../reporter/reporter.service';
import { ProcessorController } from './processor.controller';
import { ProcessorService } from './processor.service';

describe('ProcessorController', () => {
  let processorController: ProcessorController;
  let processorService: ProcessorService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProcessorController],
      providers: [ProcessorService, ReporterService],
    }).compile();

    processorController = app.get<ProcessorController>(ProcessorController);
    processorService = app.get<ProcessorService>(ProcessorService);
  });

  describe('process', () => {
    it('should call ProcessorService.processTelemetryMessage with telemetry messge', () => {
      const telemetryMsg = {} as TelemetryMessage;

      const spyProcessTelemetryMessage = jest.spyOn(
        processorService,
        'processTelemetryMessage',
      );

      processorController.process(telemetryMsg);

      expect(spyProcessTelemetryMessage).toBeCalledWith(telemetryMsg);
    });
  });
});
