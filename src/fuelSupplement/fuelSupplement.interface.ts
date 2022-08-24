import { FuelResponse } from "src/fuel/fuel.interface";
import { StationDb } from "src/station/station.interface";

export class FuelSupplementResponse {
    // [key:string]: string;
    Fuels: FuelResponse[];
}

export class FuelSupplementDb {
    FuelSupplementId: string;
    Number: string;
    // Fuels: string[];
    StationId: string;
}