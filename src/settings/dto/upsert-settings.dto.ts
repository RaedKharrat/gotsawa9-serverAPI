import { IsDefined, IsObject } from 'class-validator';

export class UpsertSettingsDto {
  @IsDefined()
  @IsObject()
  settings: Record<string, string>;
}
