import { Alias } from './Alias';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ConfigService {

    constructor (){
        Alias.configService = this;
    }
    public readonly gamesPerGeneration:number = 44;

    public get bestGamesSeedCount ():number {
        return Math.ceil(this.gamesPerGeneration / 5);
    }

    public get bestGamesChildrenCount ():number {
        return this.gamesPerGeneration * .75;
    }

    public readonly autoRunNextgeneration:boolean = false;

    public width:number = 15;
    public height:number = 15;
    public readonly tileSize:number = 6;
    public readonly fps:number = 40;
    public readonly snakeStartLength:number = 3;
    public readonly hiddenNeurons:number = 12;
    public readonly bestStoredSnakesCount:number = 4;
    public readonly hallOfFameLength:number = 5;
    public mutationRate:number = .2;
}