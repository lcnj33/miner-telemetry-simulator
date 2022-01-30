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
    it('should report miner health failure when up to down', async () => {
      const mockTelemetry = createMockTelemetry({ health: 'down' });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(
        createMockTelemetry({ health: 'up' }),
      );
      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Miner health failure. State: down.',
        mockTelemetry,
      );
    });

    it('should not report failure when health was down', async () => {
      const mockTelemetry = createMockTelemetry({ health: 'down' });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(
        createMockTelemetry({ health: 'down' }),
      );
      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(0);
    });

    it('should report a gigahashrate dip', async () => {
      const mockTelemetry = createMockTelemetry({ gigahashrate: 0 });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(
        createMockTelemetry({ gigahashrate: 100671.28 }),
      );
      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Detected a dip in gigahashrate. Gigahashrate: 0.',
        mockTelemetry,
      );
    });

    it('should report failure when pool connection is from up to down', async () => {
      const mockTelemetry = createMockTelemetry({ pool_connection: 'down' });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(
        createMockTelemetry({ pool_connection: 'up' }),
      );
      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Miner is diconnected with the configured pool. State: down.',
        mockTelemetry,
      );
    });

    it('should report fan in temperature spike', async () => {
      const mockTelemetry = createMockTelemetry({ temp1_in: 100 });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(
        createMockTelemetry({ temp1_in: 50 }),
      );
      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Detected a fan temperature spike. Sensor: temp1_in, Temperature: 100.',
        mockTelemetry,
      );
    });

    it('should report a fan failure', async () => {
      const mockTelemetry = createMockTelemetry({ fan3: 0 });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(
        createMockTelemetry({ fan3: 5000 }),
      );

      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(1);
      expect(spyReportMinerExeception).toBeCalledWith(
        'Detected a fan failure. Fan: fan3, Speed: 0.',
        mockTelemetry,
      );
    });

    it.only('should report multiple fans failure', async () => {
      const mockTelemetry = createMockTelemetry({ fan1: 0, fan3: 0 });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(
        createMockTelemetry({ fan1: 5000, fan3: 5000 }),
      );

      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledTimes(2);
    });

    it.only('should report all fans temperature spike', async () => {
      const mockTelemetry = createMockTelemetry({
        temp1_in: 100,
        temp2_in: 100,
        temp3_in: 100,
        temp4_in: 100,
      });
      const spyReportMinerExeception = jest
        .spyOn(reporterService, 'reportMinerExeception')
        .mockReturnValue();

      await processorService.processTelemetry(createMockTelemetry({}));
      await processorService.processTelemetry(mockTelemetry);

      expect(spyReportMinerExeception).toBeCalledWith(
        'Detected all fans temperature spike. There could be an ambient temperature rise.',
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
