import { type Relation, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Area from "./Area.js";
import Leitura from "./Leitura.js";

@Entity("sensor")
export class Sensor {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true, nullable: false })
    serialNumber!: string;

    @Column({ type: "varchar", nullable: false })
    fabricante!: string;

    @Column({ type: "varchar", nullable: false })
    modelo!: string;

    @Column({ type: "varchar", nullable: false })
    tipo!: string;

    @Column({ type: "varchar", nullable: false })
    status!: string; // Ativo, Inativo, Manutencao

    @Column({ type: "varchar", nullable: true })
    ipFixo?: string;

    @Column({ type: "date", nullable: false })
    dataInstalacao!: Date;

    @Column({ type: "date", nullable: true })
    dataManutencao?: Date;

    @Column({ type: "integer", nullable: false })
    cicloLeitura!: number;

    @Column({ type: "decimal", precision: 10, scale: 8, nullable: false })
    latitude!: number;

    @Column({ type: "decimal", precision: 11, scale: 8, nullable: false })
    longitude!: number;

    @ManyToOne(() => Area, (area) => area.sensores)
    @JoinColumn({ name: "area_id" })
    area!: Relation<Area>;

    @OneToMany(() => Leitura, (leitura) => leitura.sensor)
    leituras!: Relation<Leitura>[]

    @Column({ type: "varchar", nullable: true })
    finalidade?: string;
}