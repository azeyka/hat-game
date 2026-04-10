import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity() export class Room {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column() hostId!: string; @Column('uuid', { array: true, default: '{}' }) packIds!: string[];
    @Column({ default: 5 }) timePerWord!: number; @Column({ default: 10 }) wordsPerRound!: number;
    @Column({ default: true }) bonusFor10!: boolean;
    @Column({ default: true }) deductOnSkip!: boolean; }