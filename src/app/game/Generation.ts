import { TfSnake } from './TfSnake';
import { StaticGeneration } from './StaticGeneration';
import { GameUtils } from './GameUtils';
import { EventEmitter } from '@angular/core';
import { Alias } from './../Alias';
import { Game } from './Game';

export class Generation extends StaticGeneration {

    constructor (){
        super ();
    }

    private getMutatedSnake (seed:number):TfSnake {
        const index:number = seed % this.seedSnakes.length;
        return this.seedSnakes[index].getMutatedClone ();
    }

    public next ():Generation {
        const newOne:Generation = new Generation ();
        newOne.generationNumber = this.generationNumber + 1;
        return newOne;
    }

    public destroy ():void {
        this.subscribtions.forEach ((subscribtion:any)=>subscribtion.unsubscribe ());
    }

    public run (seedSnakes:TfSnake[]):void {
        this.seedSnakes = seedSnakes;
        this.games = [];
        this.endedCount = 0;

        for(let i:number = 0; i < Alias.configService.gamesPerGeneration; ++i){
            if(i <= Alias.configService.bestGamesChildrenCount || this.generationNumber > 50){
                this.createGame(this.getMutatedSnake(i));
            }else{
                this.createGame(new TfSnake ());                
            }
        }
    }

    private createGame (snake:TfSnake):void {
        let game:Game = new Game (Alias.configService.width, Alias.configService.height, Alias.configService.tileSize);
        this.subscribtions.push (game.ended.subscribe (()=>this.handleGameEnded (game)));
        this.games.push(game);

        game.start (snake);        
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
