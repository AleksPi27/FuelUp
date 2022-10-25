import { Injectable, Logger } from '@nestjs/common';
import {
  FuelandFuelSupplementDb,
  FuelPriceDb,
  FuelResponse,
} from './fuel.interface';
import { appendFile, open } from 'fs';
import {
  createFile,
  generateUuidV4,
  getSavedCollection,
  saveToFile,
} from 'src/common/common.utils';
import axios from 'axios';
import { StationDb, StationResponse } from 'src/station/station.interface';
import { FuelSupplementDb } from 'src/fuelSupplement/fuelSupplement.interface';

@Injectable()
export class FuelService {
  private stationsForFuelPrice: StationResponse[] = [];
  private logger: Logger = new Logger(FuelService.name);
  private fuelPricestoSave: FuelPriceDb[] = [];
  private fuelsAndFuelSupplementstoSave: FuelandFuelSupplementDb[] = [];
  private savedStations: StationDb[] = [];
  private savedFuelSupplements: FuelSupplementDb[] = [];

  constructor() {
    createFile(process.env.FUEL_PRICES_FILE);
    createFile(process.env.FUEL_AND_FUEL_SUPPLEMENTS_FILE);
  }

  async getStationsforFuelPrices(): Promise<void> {
    try {
      const { data: stations }: { data: StationResponse[] } = await axios.get(
        `${process.env.URL}${process.env.APIKEY}`,
      );
      this.stationsForFuelPrice = stations;
    } catch (err) {
      this.logger.error(`Error while getting stations: ${err}`);
      throw new Error(err);
    }
  }

  findSavedStationId(currentStation: StationResponse): StationDb | null {
    return this.savedStations.find(({ Id }) => Id === currentStation.Id);
  }

  findFuelSupplementsBelongingtoStation(
    currentStation: StationDb,
  ): FuelSupplementDb[] | null {
    try {
      return this.savedFuelSupplements.filter(
        (fuelSupplement: FuelSupplementDb) =>
          fuelSupplement.StationId === currentStation.StationId,
      );
    } catch (err) {
      this.logger.error(
        `Error while retrieving saved fuel supplements for the station`,
      );
      throw new Error(err);
    }
  }

  findFuelSupplementContainingCurrentFuel(
    fuelSupplementsOnCurrentStation: FuelSupplementDb[],
    columnNumber: string,
  ): FuelSupplementDb | null {
    return fuelSupplementsOnCurrentStation.find(
      (fuelSupplementOnParentStation: FuelSupplementDb) =>
        fuelSupplementOnParentStation.Number === columnNumber,
    );
  }

  async processFuelPrices(): Promise<void> {
    this.logger.log(`Loading saved stations and fuel supplements from files`);
    this.savedStations = await getSavedCollection(process.env.STATIONS_FILE);
    this.savedFuelSupplements = await getSavedCollection(
      process.env.FUEL_SUPPLEMENTS_FILE,
    );

    this.logger.log(
      `Started processing fuel prices of ${this.stationsForFuelPrice.length} stations`,
    );

    try {
      this.stationsForFuelPrice.forEach((station: StationResponse) => {
        const savedStation: StationDb = this.findSavedStationId(station);
        let fuelSupplementsOnCurrentStation: FuelSupplementDb[] = [];

        try {
          fuelSupplementsOnCurrentStation =
            this.findFuelSupplementsBelongingtoStation(savedStation);
        } catch (err) {
          this.logger.error(`No such station with fuel supplements`);
          throw new Error(err);
        }

        station.Fuels?.forEach((fuelResponse: FuelResponse) => {
          const { Id, Type, Price } = fuelResponse;
          const fuelUuid: string = generateUuidV4();

          if (station.Columns) {
            for (const [columnNumber, column] of Object.entries(
              station.Columns,
            )) {
              if (column.Fuels.includes(Id)) {
                const fuelSupplementWithThisFuel: FuelSupplementDb =
                  this.findFuelSupplementContainingCurrentFuel(
                    fuelSupplementsOnCurrentStation,
                    columnNumber,
                  );

                this.fuelsAndFuelSupplementstoSave.push({
                  FuelId: fuelUuid,
                  FuelSupplementId: fuelSupplementWithThisFuel.FuelSupplementId,
                } as FuelandFuelSupplementDb);
              }
            }
          } else {
            this.logger.log(
              `This station with id - ${station.Id} doesn't have any fuel supplements`,
            );
          }

          this.fuelPricestoSave.push({
            FuelId: fuelUuid,
            Id,
            Type,
            Price,
            StationId: savedStation.StationId,
          } as FuelPriceDb);
        });
        if (this.fuelPricestoSave.length > 0) {
          saveToFile(process.env.FUEL_PRICES_FILE, this.fuelPricestoSave);
        }
        if (this.fuelsAndFuelSupplementstoSave.length > 0) {
          saveToFile(
            process.env.FUEL_AND_FUEL_SUPPLEMENTS_FILE,
            this.fuelsAndFuelSupplementstoSave,
          );
        }
      });
    } catch (err) {
      this.logger.error(`Error while processing fuel prices: ${err}`);
    }
  }
}
