import { Test, TestingModule } from '@nestjs/testing';
import { SimulatorService } from '../simulator/simulator.service';
import { TelemetryController } from './telemetry.controller';
import { Telemetry } from './telemetry.interface';
import { TelemetryService } from './telemetry.service';

describe('TelemetryController', () => {
  let controller: TelemetryController;
  let service: TelemetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelemetryController],
      providers: [TelemetryService, SimulatorService],
    }).compile();

    controller = module.get<TelemetryController>(TelemetryController);
    service = module.get<TelemetryService>(TelemetryService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMinerIds', () => {
    it('should return an array of Ids', () => {
      const expected = ['123'];
      jest.spyOn(service, 'getAllMinerIds').mockReturnValue(expected);

      const actual = controller.getMinerIds();
      expect(actual).toEqual(expected);
    });
  });

  describe('getTelemetry', () => {
    it('should return telemetry for the given id', () => {
      const id = 'testId';
      const expected = {} as Telemetry;

      const spyGetTelemetry = jest
        .spyOn(service, 'getTelemetry')
        .mockReturnValue(expected);

      const actual = controller.getTelemetry(id);

      expect(actual).toEqual(expected);
      expect(spyGetTelemetry).toBeCalledWith(id);
    });
  });
});
