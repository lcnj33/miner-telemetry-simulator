import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { ReporterService } from '../src/reporter/reporter.service';

describe('ProcessorController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let spyReporterService: ReporterService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ClientsModule.register([{ name: 'PUBSUB', transport: Transport.TCP }]),
      ],
    })
      .overrideProvider(ReporterService)
      .useValue({
        reportErrorMessage: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.TCP,
    });
    await app.startAllMicroservices();
    await app.init();

    client = app.get('PUBSUB');
    await client.connect();

    spyReporterService = app.get<ReporterService>(ReporterService);
  });

  afterAll(async () => {
    await app.close();
    client.close();
  });

  it('should process error message', (done) => {
    const observable = client.send('telemetry', {
      ok: false,
      miner_id: '123',
      error: 'Error',
    });

    observable.subscribe({
      complete: () => {
        expect(spyReporterService.reportErrorMessage).toBeCalledTimes(1);
        done();
      },
    });
  });
});
