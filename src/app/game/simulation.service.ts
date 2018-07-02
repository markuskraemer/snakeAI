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
    private countdown:number = 0;
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
    ) { 
        tickService.tick.subscribe ( () => {
            if(this.generationIsFinished){
                if(this.autoRunNextGeneration && this.countdown -- == 0){
                    this.runNextGeneration ();
                }
            }
        })

    }


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
            this.countdown = 30;

        }
    }

    private updateStatistic ():void {
        this.statistic.push({
            longest:this.currentGeneration.getLongestSnakeLength (), 
            average:this.currentGeneration.getAverageSnakeLength (),
            generationNumber: this.currentGeneration.generationNumber});
        if(this.statistic.length > 100){
            this.statistic = this.statistic.filter((value:IGenerationStatistic, index:number) => { return index % 2 == 0 });
        }
    }

    private storeBestSnakes ():void {
        const bestSnakes:AISnake[] = this.currentGeneration.getBestSnakes ();
        const bestSnakesJSON:any[] = [];
        bestSnakes.forEach((snake:AISnake) => bestSnakesJSON.push(snake.toJSON()));
        this.storageService.save ('bestPool', bestSnakesJSON);
    }

}