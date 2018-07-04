import { GameUtils } from './GameUtils';
import { EventEmitter } from '@angular/core';
import { Alias } from './../Alias';
import { AISnake } from './AISnake';
import { Game } from './Game';
export class StaticGeneration {

    protected subscribtions:any[] = [];
    protected endedCount:number;
    public generationNumber:number = 0;
    public games:Game[];
    public readonly finished:EventEmitter<null> = new EventEmitter ();

    constructor (protected seedSnakes:AISnake[]){
    }

    public destroy ():void {
        this.subscribtions.forEach ((subscribtion:any)=>subscribtion.unsubscribe ());
    }

    public run ():void {
        if(this.seedSnakes == null || this.seedSnakes.length == 0){
            console.error("no seed snakes! cannot start run");
            return;
        }

        this.games = [];
        this.endedCount = 0;
        for(let i:number = 0; i < this.seedSnakes.length; ++i){
            let game:Game = new Game (Alias.configService.width, Alias.configService.height, Alias.configService.tileSize);
            this.subscribtions.push (game.ended.subscribe (()=>this.handleGameEnded (game)));
            this.games.push(game);
            let snake:AISnake = this.seedSnakes[i].clone ();
            game.start (snake);
        }
    }
    
    public getBestSnakes ():AISnake []{        
        const gamesCopy:Game[] = this.getBestGames ();
        return gamesCopy.map ((game:Game) => { return game.snake });
    }

    public getBestGames ():Game []{
        const count:number = Alias.configService.bestGamesCount;
        const gamesCopy:Game[] = GameUtils.sortGames (this.games);
        gamesCopy.splice(count);
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
