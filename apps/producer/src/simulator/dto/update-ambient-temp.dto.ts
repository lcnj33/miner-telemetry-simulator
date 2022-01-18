import { IsInt } from 'class-validator';
export class UpdateAmbientTempDto {
  @IsInt({ message: 'A temperature must be provided' })
  temperature: number;
}
