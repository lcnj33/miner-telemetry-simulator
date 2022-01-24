import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { PollerService } from './poller.service';
import { of } from 'rxjs';
import async from 'async';

describe('SimulatorService', () => {
  let pollerService: PollerService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        PollerService,
        ConfigService,
        {
          provide: 'PUBSUB',
          useFactory: () => {
            return ClientProxyFactory.create({});
          },
        },
      ],
    }).compile();

    pollerService = module.get<PollerService>(PollerService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('poll', () => {
    it('should send request to poll telemetry for configured miners', () => {
      const numberOfMiners = 5;
      jest.spyOn(configService, 'get').mockImplementation((prop) => {
        if (prop === 'poller.numberOfMiners') {
          return numberOfMiners;
        }
      });

      // running async.each syncly
      jest
        .spyOn(async, 'each')
        .mockImplementation((arr: string[], fn: any): any => {
          arr.forEach((element) => {
            fn(element);
          });
        });

      pollerService.onModuleInit();

      const mockData = {};
      const response = {
        data: mockData,
        headers: {},
        config: {},
        status: 200,
        statusText: 'OK',
      };

      const spyGet = jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(response));
      pollerService.poll();

      expect(spyGet).toBeCalledTimes(numberOfMiners);
    });
  });
});
