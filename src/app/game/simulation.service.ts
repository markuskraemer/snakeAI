import { IGenerationStatistic } from './../model/IGenerationStatistic';
import { ConfigService } from './../config.service';
import { Alias } from './../Alias';
import { TickService } from './../tick.service';
import { AISnake } from './AISnake';
import { IStorageDescribtion } from './../storage/IStorageDescribtion';
import { StorageService } from './../storage/storage.service';
import { Generation } from './Generation';
import { Injectable } from '@angular/core';

@Injectable()
export class SimulationService {

    private subscribtion:any;
    private timeout:any;
    private _autoRunNextGeneration:boolean = true;
    private generationIsFinished:boolean;

    public currentGeneration:Generation;
    public statistic:IGenerationStatistic[] = [];

    public set autoRunNextGeneration (value:boolean){
        if(this._autoRunNextGeneration != value){
            this._autoRunNextGeneration = value;
            if(this._autoRunNextGeneration && this.generationIsFinished){
                this.runNextGeneration ();
            }
        }
    }

    public get autoRunNextGeneration ():boolean {
        return this._autoRunNextGeneration;      
    }


    constructor(
        public storageService:StorageService,
        public tickService:TickService,
        public configService:ConfigService
    ) { }


    public runFirstOrStoredGeneration ():void {
        
        const fileList:any[] = this.storageService.load ('bestPool');
        const startSnakes:AISnake[] = [];
        
        if(fileList && fileList.length > 0){
            fileList.forEach((value:JSON, index:number) => {
                startSnakes.push(AISnake.fromJSON(value));
            })
        }else{
            startSnakes.push(new AISnake ());
        }

        this.currentGeneration = new Generation (startSnakes);
        this.doRunGeneration ();
    }

    private runNextGeneration () {
        const oldGeneration:Generation = this.currentGeneration;
        this.currentGeneration = oldGeneration.next ();
        oldGeneration.destroy ();
        this.doRunGeneration ();
    } 

    private doRunGeneration ():void {
        this.generationIsFinished = false;
        this.subscribtion = this.currentGeneration.finished.subscribe (()=>this.handleGenerationFinished());
        this.currentGeneration.run ();
    }

    private handleGenerationFinished ():void {
        this.generationIsFinished = true;
        console.log("Simulation handleGenerationFinished");
        if(this.subscribtion){
            this.subscribtion.unsubscribe ();
        }
        
        this.updateStatistic ();
        this.storeBestSnakes ();

        if(this.autoRunNextGeneration) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout (()=> this.runNextGeneration (), 500 / (this.tickService.speed/60));
        }
    }

    private updateStatistic ():void {
        this.statistic.push({longest:this.currentGeneration.getLongestSnakeLength (), average:this.currentGeneration.getAverageSnakeLength ()});
    }

    private storeBestSnakes ():void {
        const bestSnakes:AISnake[] = this.currentGeneration.getBestSnakes ();
        const bestSnakesJSON:any[] = [];
        bestSnakes.forEach((snake:AISnake) => bestSnakesJSON.push(snake.toJSON()));
        this.storageService.save ('bestPool', bestSnakesJSON);
    }

}