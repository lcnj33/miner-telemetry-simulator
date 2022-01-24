import { Test, TestingModule } from '@nestjs/testing';
import { MinerSimulationInfo } from '../simulator/simulator.interface';
import { SimulatorService } from '../simulator/simulator.service';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  let telemetryService: TelemetryService;
  let simulatorService: SimulatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelemetryService, SimulatorService],
    }).compile();

    telemetryService = module.get<TelemetryService>(TelemetryService);
    simulatorService = module.get<SimulatorService>(SimulatorService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllMinerIds', () => {
    it('should return an array of Ids', () => {
      const expected = ['123'];
      jest.spyOn(simulatorService, 'getMinerIds').mockReturnValue(expected);

      const actual = telemetryService.getAllMinerIds();
      expect(actual).toEqual(expected);
    });
  });

  describe('getTelemetry', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return a telemetry for the given id', () => {
      const id = 'testId';
      const fakeTime = 1640995200000;
      const mockMinerSimulationInfo: MinerSimulationInfo = {
        minerInfo: {
          id,
          location: {
            zone: 'Green',
            rack: 1,
            shelf: 1,
          },
        },
        lastMetrics: {
          health: 'down',
          temp1_in: 123,
          temp1_out: 234,
          temp2_in: 123,
          temp2_out: 234,
          temp3_in: 123,
          temp3_out: 234,
          temp4_in: 123,
          temp4_out: 234,
          fan1: 5000,
          fan2: 5000,
          fan3: 5000,
          fan4: 5000,
          pool_connection: 'down',
          gigahashrate: 0,
        },
        up_timestamp: 123,
      };

      const spyCreateOrGetMinerSimulationInfo = jest
        .spyOn(simulatorService, 'createOrGetMinerSimulationInfo')
        .mockReturnValue(mockMinerSimulationInfo);

      jest.useFakeTimers().setSystemTime(fakeTime);
      const actual = telemetryService.getTelemetry(id);

      expect(spyCreateOrGetMinerSimulationInfo).toBeCalledWith(id);
      expect(actual).toStrictEqual({
        id,
        location: {
          zone: 'Green',
          rack: 1,
          shelf: 1,
        },
        health: 'down',
        temp1_in: 123,
        temp1_out: 234,
        temp2_in: 123,
        temp2_out: 234,
        temp3_in: 123,
        temp3_out: 234,
        temp4_in: 123,
        temp4_out: 234,
        fan1: 5000,
        fan2: 5000,
        fan3: 5000,
        fan4: 5000,
        pool_connection: 'down',
        gigahashrate: 0,
        timestamp: fakeTime,
      });
    });
  });
});
