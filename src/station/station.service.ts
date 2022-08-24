import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { StationDb, StationResponse } from './station.interface';
import { open, appendFile } from 'fs';
import { generateUuidV4 } from 'src/common/common.utils';
import { FuelSupplementDb } from 'src/fuelSupplement/fuelSupplement.interface';
import { FuelSupplementService } from 'src/fuelSupplement/fuelSupplement.service';
require('dotenv').config();

@Injectable()
export class StationService {
  private readonly logger: Logger = new Logger(StationService.name);
  private stations: StationResponse[] = [];
  private stationstoSave: StationDb[]=[];
  constructor(private readonly fuelSupplementService: FuelSupplementService) {
    open(process.env.STATIONS_FILE, 'w', (err) => {
      if (err) {
        this.logger.error(
          `Error while creating file for saving stations: ${err}`,
        );
      }
    });
  }

  async getStations(): Promise<void> {
    this.logger.log(`Getting all stations`);
    try {
      const { data: stations }: { data: StationResponse[] } = await axios.get(
        `${process.env.URL}${process.env.APIKEY}`,
      );
      this.logger.log(`Finished getting stations`);
      this.stations = stations;
    } catch (err) {
      this.logger.error(`Error while getting stations: ${err}`);
      throw new Error(err);
    }
  }

  async processStations(): Promise<any> {
    const fuelSupplements: FuelSupplementDb[] = [];
    try {
      this.logger.log(
        `Received info about ${this.stations.length} stations - starting processing them`,
      );

      this.stations.forEach((station: StationResponse) => {
        station.StationId = generateUuidV4();

        if (station.Columns) {
          for (const number of Object.keys(station.Columns)) {
            fuelSupplements.push({
              FuelSupplementId: generateUuidV4(),
              Number: number,
              StationId: station.StationId,
            } as FuelSupplementDb);
          }
        } else {
          this.logger.log(
            `This station with id - ${station.Id} doesn't have any fuel supplements`,
          );
        }
        if (station.Fuels){
            this.logger.log(`This station with id - ${station.Id} doesn't have any fuels`);
        }
        const {Columns, Fuels, ...stationtoSave} =station;
        this.stationstoSave.push(stationtoSave as StationDb);
      });

      this.fuelSupplementService.saveFuelSupplementsToFile(fuelSupplements);
      this.saveStations();
    } catch (err) {
      this.logger.error(`Error occured while saving fuel stations: ${err}`);
      throw new Error(err);
    }
  }

  saveStations(): void {
    this.logger.log(`Started saving stations`);
    appendFile(
      process.env.STATIONS_FILE,
      JSON.stringify(this.stationstoSave, null, '\t'),
      (err) => {
        if (err) {
          this.logger.error(`Error while saving stations to the file: ${err}`);
        }
      },
    );
    this.logger.log(`Finished saving stations`);
  }
}
