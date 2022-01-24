import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAmbientTempDto } from './dto/update-ambient-temp.dto';
import { SimulatorController } from './simulator.controller';
import { SimulatorService } from './simulator.service';

describe('SimulatorController', () => {
  let controller: SimulatorController;
  let service: SimulatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulatorController],
      providers: [SimulatorService],
    }).compile();

    controller = module.get<SimulatorController>(SimulatorController);
    service = module.get<SimulatorService>(SimulatorService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMinerIds', () => {
    it('should return an array of Ids', () => {
      const expected = ['123'];
      jest.spyOn(service, 'getMinerIds').mockReturnValue(expected);

      const actual = controller.getMinerIds();
      expect(actual).toEqual(expected);
    });
  });

  describe('getAmbientTemp', () => {
    it('should return a number', () => {
      const expected = 30;
      jest.spyOn(service, 'getAmbientTemp').mockReturnValue(expected);

      const actual = controller.getAmbientTemp();
      expect(actual).toEqual(expected);
    });
  });

  describe('updateAmbientTemp', () => {
    it('should set temperature with the given number', () => {
      const expected = 30;
      const updateDto: UpdateAmbientTempDto = {
        temperature: expected,
      };
      const spySetAmbientTemp = jest.spyOn(service, 'setAmbientTemp');

      controller.updateAmbientTemp(updateDto);
      expect(spySetAmbientTemp).toBeCalledWith(expected);
    });
  });
});
