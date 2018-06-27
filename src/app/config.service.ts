import { Alias } from './Alias';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ConfigService {

    constructor (){
        Alias.configService = this;
    }
    public readonly width:number = 15;
    public readonly height:number = 15;
    public readonly tileSize:number = 25;
    public readonly fps:number = 20;
    public readonly snakeStartLength:number = 3;
    public readonly hiddenNeurons:number = 8;
    public readonly bestStoredSnakesCount:number = 4;
}