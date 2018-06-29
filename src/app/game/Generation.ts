import { EventEmitter } from '@angular/core';

import { AISnake } from './AISnake';
import { Alias } from './../Alias';
import { Game } from './Game';
export class Generation {

    private subscribtions:any[] = [];
    private endedCount:number;
    public generationNumber:number = 0;
    public games:Game[];
    public readonly finished:EventEmitter<null> = new EventEmitter ();

    constructor (private seedSnakes:AISnake[]){

    }

    private getMutatedSnake (seed:number):AISnake {
        const index:number = seed % this.seedSnakes.length;
        return this.seedSnakes[index].getMutatedClone ();
    }

    public next ():Generation {
        const best:AISnake[] = this.getBestSnakes ()
        const newOne:Generation = new Generation (best);
        newOne.generationNumber = this.generationNumber + 1;
        return newOne;
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
        for(let i:number = 0; i < Alias.configService.gamesPerGeneration; ++i){
            let game:Game = new Game (Alias.configService.width, Alias.configService.height, Alias.configService.tileSize);
            this.subscribtions.push (game.ended.subscribe (()=>this.handleGameEnded (game)));
            this.games.push(game);
            let snake:AISnake = this.getMutatedSnake (i);
            game.start (snake);
        }
    }

    public getBestSnakes ():AISnake []{        
        const gamesCopy:Game[] = this.getBestGames ();

        const snakes:AISnake[] = []; 
        gamesCopy.forEach ((game:Game)=>snakes.push(game.snake));

        return snakes;
    }

    public getBestGames ():Game []{

        const count:number = Alias.configService.bestGamesCount;
        const gamesCopy:Game[] = this.games.concat ();
        gamesCopy.sort ((a:Game, b:Game) => {
            
            if(a.snake.bodyParts.length > b.snake.bodyParts.length){
                return -1;
            }else if(a.snake.bodyParts.length == b.snake.bodyParts.length){
                
                if(a.snake.ticks > b.snake.ticks){
                    return -1;
                }else{
                    return 1;
                }                    

            }else{
                return 1
            }
        });
        
        gamesCopy.splice(count);
        return gamesCopy;
    }



    private handleGameEnded (game:Game):void {
        ++this.endedCount;
        if(this.endedCount == this.games.length){
            console.log("Generation all games have ended!");

            const bestGames:Game[] = this.getBestGames ();
            bestGames.forEach ((game:Game)=>{game.isGood=true});

            this.finished.emit ();
        }
    }


}
