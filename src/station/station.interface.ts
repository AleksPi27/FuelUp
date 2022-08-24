import {FuelResponse} from '../fuel/fuel.interface';
import {FuelSupplementResponse} from '../fuelSupplement/fuelSupplement.interface';

export class StationResponse{
    StationId: string;
    Id: string;
    Name: string;
    Address: string;
    Brand: string;
    BrandId: string;
    Location: Location;
    TakeOffBefore: string;
    PostPay: boolean;
    Enable: boolean;
    Columns?: Map<string, FuelSupplementResponse>;
    Fuels?: FuelResponse[];
}

export class StationDb{
    StationId: string;
    Id: string;
    Name: string;
    Address: string;
    Brand: string;
    BrandId: string;
    Location: Location;
    TakeOffBefore: string;
    PostPay: boolean;
    Enable: boolean;
}

class Location {
    Lon: number;
    Lat: number;
}


