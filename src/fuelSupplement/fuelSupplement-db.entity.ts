import { Fuel } from "src/fuel/fuel-db.entity";
import { Station } from "src/station/station-db.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FuelSupplement {
    @PrimaryGeneratedColumn("uuid")
    fuelSupplementId: string;

    @Column()
    number: string;

    @OneToMany(()=>Fuel, (fuel)=>fuel.fuelSupplement)
    fuels: Fuel[];

    @ManyToOne(()=>Station, (station) => station.columns)
    station: Station;
}