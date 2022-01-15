import { Test, TestingModule } from '@nestjs/testing';
import { PollerController } from './poller.controller';
import { PollerService } from './poller.service';

describe('PollerController', () => {
  let pollerController: PollerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PollerController],
      providers: [PollerService],
    }).compile();

    pollerController = app.get<PollerController>(PollerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      //expect(pollerController.getHello()).toBe('Hello World!');
    });
  });
});
