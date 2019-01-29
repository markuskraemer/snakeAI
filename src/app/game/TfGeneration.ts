import { GameUtils } from './GameUtils';
import { Alias } from './../Alias';
import { EventEmitter } from '@angular/core';
import { Game } from './Game';
import { TfSnake } from './TfSnake';
export class TfGeneration {
    
    protected subscribtions:any[] = [];
    protected endedCount:number;
    public generationNumber:number = 0;
    public games:Game[];
    public readonly finished:EventEmitter<null> = new EventEmitter ();


    constructor (private seedSnakes:TfSnake[]){

    }

     public destroy ():void {
        this.subscribtions.forEach ((subscribtion:any)=>subscribtion.unsubscribe ());
    }

    private getMutatedSnake (seed:number):TfSnake {
        const index:number = seed % this.seedSnakes.length;
        return this.seedSnakes[index].getMutatedClone ();
    }

    public next ():TfGeneration {
        const best:TfSnake[] = this.getBestSnakes ()
        const newOne:TfGeneration = new TfGeneration (best);
        newOne.generationNumber = this.generationNumber + 1;
        return newOne;
    }

    private startNextGeneration ():void {
        this.runStatic ();
    }

    public runStatic ():void {
        if(this.seedSnakes == null || this.seedSnakes.length == 0){
            console.error("no seed snakes! cannot start run");
            return;
        }

        this.games = [];
        this.endedCount = 0;
        for(let i:number = 0; i < this.seedSnakes.length; ++i){
            let game:Game = new Game (Alias.configService.width, Alias.configService.height, Alias.configService.tileSize);
            this.subscribtions.push (game.ended.subscribe (()=>this.handleGameEndedStatic (game)));
            this.games.push(game);
            let snake:TfSnake = this.seedSnakes[i].clone ();
            game.start (snake);
        }
    }

    public run ():void {
        if(this.seedSnakes == null || this.seedSnakes.length == 0){
            console.error("no seed snakes! cannot start run");
            return;
        }

        this.games = [];
        this.endedCount = 0;
         for(let i:number = 0; i < Alias.configService.gamesPerGeneration; ++i){
            let game:Game = new Game (Alias.configService.width, Alias.configService.height, Alias.configService.tileSize);
            this.subscribtions.push (game.ended.subscribe (()=>this.handleGameEnded (game)));
            this.games.push(game);

            let snake:TfSnake = this.getMutatedSnake (i);
            game.start (snake);
        }
    }
    
    public getBestSnakes ():TfSnake []{        
        const gamesCopy:Game[] = this.getBestGames ();
        return gamesCopy.map ((game:Game) => { return game.snake });
    }

    public getBestGames ():Game []{
        const gamesCopy:Game[] = GameUtils.sortGames (this.games);
        gamesCopy.splice(Alias.configService.bestGamesSeedCount);
        return gamesCopy;
    }

    public getLongestSnakeLength ():number {
        const gamesCopy:Game[] = GameUtils.sortGames (this.games);
        return gamesCopy[0].snake.bodyParts.length;
    }

    public getAverageSnakeLength ():number {
        let totalLength:number = 0;
        this.games.forEach ((game:Game)=>totalLength += game.snake.bodyParts.length);
        return totalLength / this.games.length;
    }

    protected handleGameEndedStatic (game:Game):void {
        ++this.endedCount;
        if(this.endedCount == this.games.length){
            // this.finished.emit ();
            this.runStatic ();
        }
    }

    private handleGameEnded (game:Game):void {
        ++this.endedCount;
        if(this.endedCount == this.games.length){
            // this.finished.emit ();
            const best:TfSnake[] = this.getBestSnakes ();
            this.seedSnakes = best;
            this.generationNumber = this.generationNumber + 1;
            this.run ();
        }
    }
}