import { Body, Controller, Get, Put } from '@nestjs/common';
import { UpdateAmbientTempDto } from './dto/update-ambient-temp.dto';
import { SimulatorService } from './simulator.service';

@Controller('simulator')
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Get('/miner-ids')
  public getMinerIds(): string[] {
    return this.simulatorService.getMinerIds();
  }

  @Put('/ambient-temp')
  updateAmbientTemp(@Body() updateAmbientTempDto: UpdateAmbientTempDto) {
    const { temperature } = updateAmbientTempDto;
    this.simulatorService.setAmbientTemp(temperature);

    return `The ambient temperature has been upated to ${temperature} celsius.`;
  }

  @Get('/ambient-temp')
  getAmbientTemp() {
    return this.simulatorService.getAbientTemp();
  }
}
