import { Controller } from '@nestjs/common';
import { PollerService } from './poller.service';

@Controller()
export class PollerController {
  constructor(private readonly pollerService: PollerService) {}
}
