import { Test, TestingModule } from '@nestjs/testing';
import { SimulatorService } from './simulator.service';

describe('SimulatorService', () => {
  let service: SimulatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimulatorService],
    }).compile();

    service = module.get<SimulatorService>(SimulatorService);
  });

  describe('createOrGetMinerSimulationInfo', () => {
    it('should return a miner simulation info', () => {
      const id = 'testId';
      const simulationInfo = service.createOrGetMinerSimulationInfo(id);

      expect(simulationInfo.minerInfo.id).toEqual(id);
      expect(simulationInfo.lastMetrics).toBeDefined();
      expect(simulationInfo.up_timestamp).toBeDefined();
    });

    it('should create a miner simulation info', () => {
      const id = 'testId';
      service.createOrGetMinerSimulationInfo(id);

      const minerIds = service.getMinerIds();
      expect(minerIds.length).toEqual(1);
      expect(minerIds).toContain(id);
    });
  });
});
