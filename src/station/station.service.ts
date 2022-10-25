import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { StationDb, StationResponse } from './station.interface';
import { createFile, generateUuidV4 } from 'src/common/common.utils';
import { FuelSupplementDb } from 'src/fuelSupplement/fuelSupplement.interface';
import {saveToFile} from '../common/common.utils';
require('dotenv').config();

@Injectable()
export class StationService {
  private readonly logger: Logger = new Logger(StationService.name);
  private stations: StationResponse[] = [];
  private stationstoSave: StationDb[]=[];
  constructor() {
    createFile(process.env.STATIONS_FILE);
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
        if (!station.Fuels){
            this.logger.log(`This station with id - ${station.Id} doesn't have any fuels`);
        }
        const {Columns, Fuels, ...stationtoSave} =station;
        this.stationstoSave.push(stationtoSave as StationDb);
      });

      saveToFile(process.env.FUEL_SUPPLEMENTS_FILE, fuelSupplements);
      saveToFile(process.env.STATIONS_FILE, this.stationstoSave);
    } catch (err) {
      this.logger.error(`Error occured while saving fuel stations: ${err}`);
      throw new Error(err);
    }
  }
}
