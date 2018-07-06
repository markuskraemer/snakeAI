import { StaticGeneration } from './StaticGeneration';
import { GameUtils } from './GameUtils';
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
    private pauseCountdown:number = 0;
    private statisticCutCount:number = 0;
    public useHallOfFameAsSource:boolean;
    private _showHallOfFame:boolean;
    public hallOfFame:AISnake[] = [];
    public currentGeneration:StaticGeneration;
    public statistics:IGenerationStatistic[] = [];
    public bodyEnabled:boolean = true;
    public generationsCount:number = 0;


    public set showHallOfFame (value:boolean){
        if(this._showHallOfFame != value){
            this._showHallOfFame = value;
            this.runNextGeneration ();
        }
    }

    public get showHallOfFame (){
        return this._showHallOfFame;
    }

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
        Alias.simulation = this;
        tickService.tick.subscribe ( () => {
            if(this.generationIsFinished){
                if(this.autoRunNextGeneration && this.pauseCountdown -- == 0){
                    this.runNextGeneration ();
                }
            }
        })

    }

    public start ():void{
        this.loadHallOfFame ();
        this.runFirstOrStoredGeneration ();
    }

    private loadHallOfFame ():void {
        const fileList:any[] = this.storageService.load ('hallOfFame');        
        if(fileList && fileList.length > 0){
            fileList.forEach((value:JSON, index:number) => {
                this.hallOfFame.push(AISnake.fromJSON(value));
            })
        }     
        this.sortHallOfFame ();       
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
        const oldGeneration:StaticGeneration = this.currentGeneration;
        
        if(this.showHallOfFame){
            this.currentGeneration = new StaticGeneration (this.hallOfFame);
        }else if(this.useHallOfFameAsSource){
            this.currentGeneration = new Generation (this.hallOfFame);
        }else if(oldGeneration['next']){
            this.currentGeneration = (<Generation>oldGeneration).next ();
        }else{
            this.runFirstOrStoredGeneration ();
            return;
        }
        oldGeneration.destroy ();
        this.doRunGeneration ();
    } 

    private doRunGeneration ():void {
        this.generationsCount ++;
        this.generationIsFinished = false;
        this.subscribtion = this.currentGeneration.finished.subscribe (()=>this.handleGenerationFinished());
        this.currentGeneration.run ();
    }

    private handleGenerationFinished ():void {
        this.generationIsFinished = true;
      
        if(this.subscribtion){
            this.subscribtion.unsubscribe ();
        }
        
        this.updateStatistics ();

        if(!this.showHallOfFame){
            this.storeBestSnakes ();
            this.updateHallOfFame ();
        }

        if(this.autoRunNextGeneration) {
            this.pauseCountdown = 30;

        }
    }

    private updateStatistics ():void {
        const av:number = this.currentGeneration.getAverageSnakeLength ();
        let avProgress:number;
        if(this.statistics.length > 0){
            avProgress = 100 * av / this.statistics[0].average ;
        }else{
            avProgress = 100;
        }
        this.statistics.push({
            longest:this.currentGeneration.getLongestSnakeLength (), 
            average:this.currentGeneration.getAverageSnakeLength (),
            generationNumber: this.currentGeneration.generationNumber,
            averageProgress:avProgress                
        });

        if(this.statistics.length > 50){
            if((++ this.statisticCutCount) % 2 == 0){ 
                this.statistics.splice(1, 2);
            }
            // this.statistics = this.statistics.filter((value:IGenerationStatistic, index:number) => { return index % 2 == 0 });
        }
    }

    private storeBestSnakes ():void {
        const bestSnakes:AISnake[] = this.currentGeneration.getBestSnakes ();
        const bestSnakesJSON:any[] = [];
        bestSnakes.forEach((snake:AISnake) => bestSnakesJSON.push(snake.toJSON()));
        this.storageService.save ('bestPool', bestSnakesJSON);
    }


    private sortHallOfFame ():void {
        this.hallOfFame = GameUtils.sortSnakes (this.hallOfFame);
    }

    private updateHallOfFame ():void {

        const bestSnakes:AISnake[] = this.currentGeneration.getBestSnakes ();
        const bestFromPool:AISnake[] = bestSnakes.splice (0, this.configService.hallOfFameLength);
        this.hallOfFame = this.hallOfFame.concat (bestFromPool);
        this.hallOfFame = GameUtils.sortSnakes(this.hallOfFame);
        this.hallOfFame.length = Math.min(this.hallOfFame.length, this.configService.hallOfFameLength);
        
        const hallOfFameJSON:any[] = this.hallOfFame.map((snake:AISnake) => { return snake.toJSON (); } );

        this.storageService.save ('hallOfFame', hallOfFameJSON);

        console.log("HOF: ", hallOfFameJSON);

    }

}