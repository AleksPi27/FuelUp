import { Injectable, Logger } from '@nestjs/common';
import {
  FuelandFuelSupplement as FuelAndFuelSupplementDb,
  FuelPriceDb,
  FuelResponse,
} from './fuel.interface';
import { appendFile, open } from 'fs';
import { generateUuidV4, getSavedCollection } from 'src/common/common.utils';
import axios from 'axios';
import { StationDb, StationResponse } from 'src/station/station.interface';
import { FuelSupplementDb } from 'src/fuelSupplement/fuelSupplement.interface';

@Injectable()
export class FuelService {
  private stations: StationResponse[] = [];
  private logger: Logger = new Logger(FuelService.name);
  private fuelPricestoSave: FuelPriceDb[] = [];
  private fuelsAndFuelSupplementstoSave: FuelAndFuelSupplementDb[] = [];
  private savedStations: StationDb[] = [];
  private savedFuelSupplements: FuelSupplementDb[] = [];

  constructor() {
    open(process.env.FUEL_PRICES_FILE, 'w', (err) => {
      if (err) {
        this.logger.error(
          `Error while creating file for saving fuel prices: ${err}`,
        );
        throw new Error(err.message);
      }
    });
    open(process.env.FUEL_AND_FUEL_SUPPLEMENTS_FILE, 'w', (err) => {
      if (err) {
        this.logger.error(
          `Error while creating file for saving relations between fuels and fuel supplements: ${err}`,
        );
        throw new Error(err.message);
      }
    });
  }

  async getStationsforFuelPrices(): Promise<void> {
    try {
      const { data: stations }: { data: StationResponse[] } = await axios.get(
        `${process.env.URL}${process.env.APIKEY}`,
      );
      this.stations = stations;
    } catch (err) {
      this.logger.error(`Error while getting stations: ${err}`);
      throw new Error(err);
    }
  }

  findSavedStationId(
    savedStations: StationDb[],
    currentStation: StationResponse,
  ): StationDb | null {
    return savedStations.find(({ Id }) => Id === currentStation.Id);
  }

  findFuelSupplementsBelongingtoStation(
    currentStation: StationDb,
  ): FuelSupplementDb[] | null {
    if (currentStation.StationId) {
      return this.savedFuelSupplements.filter(
        (fuelSupplement: FuelSupplementDb) =>
          fuelSupplement.StationId === currentStation.StationId,
      );
    } else {
      throw new Error(
        `There is no station with such Id - ${currentStation.Id}`,
      );
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
      `Started processing fuel prices of ${this.stations.length} stations`,
    );

    try {
      this.stations.forEach((station: StationResponse) => {
        const currentStation: StationDb = this.findSavedStationId(
          this.savedStations,
          station,
        );

        let fuelSupplementsOnCurrentStation: FuelSupplementDb[] = [];

        fuelSupplementsOnCurrentStation =
          this.findFuelSupplementsBelongingtoStation(currentStation);

        station.Fuels?.forEach((fuelResponse: FuelResponse) => {
          const { Id, Type, Price } = fuelResponse;
          const fuelUuid: string = generateUuidV4();

          if (station.Columns) {
            for (const columnNumber of Object.keys(station.Columns)) {
              if (station.Columns[columnNumber].Fuels.includes(Id)) {
                const fuelSupplementWithThisFuel: FuelSupplementDb =
                  this.findFuelSupplementContainingCurrentFuel(
                    fuelSupplementsOnCurrentStation,
                    columnNumber,
                  );

                this.fuelsAndFuelSupplementstoSave.push({
                  FuelId: fuelUuid,
                  FuelSupplementId: fuelSupplementWithThisFuel.FuelSupplementId,
                } as FuelAndFuelSupplementDb);
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
            StationId: currentStation.StationId,
          } as FuelPriceDb);
        });
        if (this.fuelPricestoSave.length > 0) {
          this.saveFuelPrices();
        }
        if (this.fuelsAndFuelSupplementstoSave.length > 0) {
          this.saveFuelAndFuelSupplements();
        }
      });
    } catch (err) {
      this.logger.error(`Error while saving fuel prices: ${err}`);
      throw new Error(err);
    }
  }

  saveFuelPrices(): void {
    this.logger.log(`Saving ${this.fuelPricestoSave.length} fuel prices`);
    appendFile(
      process.env.FUEL_PRICES_FILE,
      JSON.stringify(this.fuelPricestoSave, null, '\t'),
      (err) => {
        if (err) {
          this.logger.error(
            `Error while saving fuel prices to the file: ${err}`,
          );
          throw new Error(err.message);
        }
      },
    );
    this.logger.log(`Finished saving fuel prices`);
  }

  saveFuelAndFuelSupplements(): void {
    this.logger.log(
      `Saving ${this.fuelsAndFuelSupplementstoSave.length} fuels and fuel supplements`,
    );
    appendFile(
      process.env.FUEL_AND_FUEL_SUPPLEMENTS_FILE,
      JSON.stringify(this.fuelsAndFuelSupplementstoSave, null, '\t'),
      (err) => {
        if (err) {
          this.logger.error(
            `Error while saving relations between fuels and fuel supplements to the file: ${err}`,
          );
          throw new Error(err.message);
        }
      },
    );
    this.logger.log(`Finished saving fuels and fuel supplements`);
  }
}
