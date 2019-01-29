import { Generation } from './Generation';
import { GameUtils } from './GameUtils';
import { EventEmitter } from '@angular/core';
import { Alias } from './../Alias';
import { TfSnake } from './TfSnake';
import { Game } from './Game';
export class StaticGeneration {

    public readonly finished:EventEmitter<null> = new EventEmitter ();
    protected subscribtions:any[] = [];
    protected endedCount:number;
    public generationNumber:number = 0;
    public games:Game[];
    protected seedSnakes:TfSnake[];

    constructor (){
    }

    public destroy ():void {
        this.subscribtions.forEach ((subscribtion:any)=>subscribtion.unsubscribe ());
    }

    public run (seedSnakes:TfSnake[]):void {
        this.seedSnakes = seedSnakes;

        this.games = [];
        this.endedCount = 0;
        for(let i:number = 0; i < this.seedSnakes.length; ++i){
            let game:Game = new Game (Alias.configService.width, Alias.configService.height, Alias.configService.tileSize);
            this.subscribtions.push (game.ended.subscribe (()=>this.handleGameEnded (game)));
            this.games.push(game);
            let snake:TfSnake = this.seedSnakes[i].clone ();
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

    protected handleGameEnded (game:Game):void {
        ++this.endedCount;
        if(this.endedCount == this.games.length){
            this.finished.emit ();
        }
    }


}
