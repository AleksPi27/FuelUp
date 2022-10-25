export class FuelResponse{
    FuelId: string;
    Id: string;
    Price: number;
    Type: string;
    TypeId: number;
    Brand: string;
    Name: string;
}

export class FuelDb{
    FuelId: string;
    Id: string;
    Price: number;
    Type: string;
    TypeId: number;
    Brand: string;
    Name: string;
    StationId: string;
    FuelSupplementId: string[];
}

export class FuelPriceDb{
    FuelId: string;
    Id: string;
    Type: string;
    Price: number;
    StationId: string;
} 

export class FuelandFuelSupplementDb {
    FuelId: string;
    FuelSupplementId: string;
}