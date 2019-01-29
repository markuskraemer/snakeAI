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

    public get bestGamesCount ():number {
        return Math.ceil(this.gamesPerGeneration / 12);
    }

    public readonly autoRunNextgeneration:boolean = true;

    public width:number = 15;
    public height:number = 15;
    public readonly tileSize:number = 6;
    public readonly fps:number = 84;
    public readonly snakeStartLength:number = 3;
    public readonly hiddenNeurons:number = 0;
    public readonly bestStoredSnakesCount:number = 4;
    public readonly hallOfFameLength:number = 5;
    public mutationRate:number = .8;
}