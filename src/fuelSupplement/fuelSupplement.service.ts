import { Injectable, Logger } from '@nestjs/common';
import { appendFile, open } from 'fs';
import { FuelSupplementDb } from './fuelSupplement.interface';
require('dotenv').config();

@Injectable()
export class FuelSupplementService {
  private readonly logger: Logger = new Logger(FuelSupplementService.name);
  constructor() {
    open(process.env.FUEL_SUPPLEMENTS_FILE, 'w', (err) => {
      if (err) {
        this.logger.error(`Error while creating file for saving fuel supplements: ${err}`);
        throw new Error(err.message);
    }
    });
  }

  saveFuelSupplementsToFile(fuelSupplements: FuelSupplementDb[]):void {
    this.logger.log(
      `Start saving ${fuelSupplements.length} fuel supplements for all the stations`,
    );
      appendFile(
        process.env.FUEL_SUPPLEMENTS_FILE,
        JSON.stringify(fuelSupplements, null, '\t'),
        (err) => {
          if (err) {
            this.logger.error(`Error while saving fuel supplements to the file: ${err}`);
            throw new Error(err.message);
          }
        },
      );
      this.logger.log(`Finished saving fuel supplements`);
    
  }
}
