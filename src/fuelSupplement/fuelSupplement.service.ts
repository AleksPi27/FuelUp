import { Injectable, Logger } from '@nestjs/common';
import { appendFile, open } from 'fs';
import { createFile } from 'src/common/common.utils';
import { FuelSupplementDb } from './fuelSupplement.interface';
require('dotenv').config();

@Injectable()
export class FuelSupplementService {
  private readonly logger: Logger = new Logger(FuelSupplementService.name);
  constructor() {
    createFile(process.env.FUEL_SUPPLEMENTS_FILE);
  }
}
