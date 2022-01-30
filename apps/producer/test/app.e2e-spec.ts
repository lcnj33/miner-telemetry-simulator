import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/telemetry/{id} (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/telemetry/123')
      .expect(200);

    const telemetry = response.body;
    expect(telemetry.id).toEqual('123');
  });
});
