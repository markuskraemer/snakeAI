import { StaticGeneration } from './StaticGeneration';
import { GameUtils } from './GameUtils';
import { EventEmitter } from '@angular/core';

import { AISnake } from './AISnake';
import { Alias } from './../Alias';
import { Game } from './Game';

export class Generation extends StaticGeneration {

    constructor (protected seedSnakes:AISnake[]){
        super (seedSnakes);
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

    protected handleGameEnded (game:Game):void {
        ++this.endedCount;
        if(this.endedCount == this.games.length){
            
            const bestGames:Game[] = this.getBestGames ();
            bestGames.forEach ((game:Game)=>{game.isGood=true});

            this.finished.emit ();
        }
    }


}
