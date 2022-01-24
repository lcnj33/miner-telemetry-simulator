import { Test, TestingModule } from '@nestjs/testing';
import { ErrorMessage } from 'apps/consumer/src/poller/poller.interface';
import { Telemetry } from 'apps/producer/src/telemetry/telemetry.interface';
import { ReporterService } from '../reporter/reporter.service';
import { ProcessorService } from './processor.service';

describe('SimulatorService', () => {
  let processorService: ProcessorService;
  let reporterService: ReporterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessorService, ReporterService],
    }).compile();

    processorService = module.get<ProcessorService>(ProcessorService);
    reporterService = module.get<ReporterService>(ReporterService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('processTelemetryMessage', () => {
    it('should call reportErrorMessage when received error message', () => {
      const mockErrorMsg: ErrorMessage = {
        ok: false,
        miner_id: '123',
        error: {},
      };
      const spyReportErrorMessage = jest.spyOn(
        reporterService,
        'reportErrorMessage',
      );

      processorService.processTelemetryMessage(mockErrorMsg);

      expect(spyReportErrorMessage).toBeCalledWith(mockErrorMsg);
    });
  });

  describe('processTelemetry', () => {
    it('should report miner health failure', async () => {
      const mockTelemetry = createMockTelemetry({ health: 'down' });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Miner health failure. State: down.',
        mockTelemetry,
      );
    });

    it('should report fan in temperature spike', async () => {
      const mockTelemetry = createMockTelemetry({ temp1_in: 100 });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Miner fan temperature spike. Sensor: temp1_in, Temperature: 100.',
        mockTelemetry,
      );
    });

    it('should report fan failure', async () => {
      const mockTelemetry = createMockTelemetry({ fan3: 0 });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Miner fan failure. Fan: fan3, Speed: 0.',
        mockTelemetry,
      );
    });
  });

  function createMockTelemetry(config: Partial<Telemetry>): Telemetry {
    const baseTelemetry = {
      id: 'testId',
      location: {
        zone: 'Green',
        rack: 1,
        shelf: 1,
      },
      health: 'up',
      temp1_in: 58,
      temp1_out: 63,
      temp2_in: 57,
      temp2_out: 59,
      temp3_in: 54,
      temp3_out: 64,
      temp4_in: 54,
      temp4_out: 59,
      fan1: 5000,
      fan2: 5000,
      fan3: 5000,
      fan4: 5000,
      pool_connection: 'up',
      gigahashrate: 100123,
      timestamp: 123,
    };

    return Object.assign(baseTelemetry, config);
  }
});
