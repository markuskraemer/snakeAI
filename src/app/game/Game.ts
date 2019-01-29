import { TfSnake } from './TfSnake';
import { EventEmitter } from '@angular/core';
import { XY } from './../model/XY';
import { Alias } from './../Alias';
export class Game {

    private subscriptions:any[] = [];

    public snake:TfSnake;
    public foodPos:XY = new XY ();
    public isRunning:boolean;
    public isGood:boolean;
    public readonly ended:EventEmitter<null> = new EventEmitter ();

    constructor (public width:number, public height:number, public tileSize:number) {
        
    }

    public start (snake:TfSnake):void {
        this.snake = snake;
        this.snake.game = this;
        this.snake.setToGameStartValues ();
        this.snake.setHeadPosition (new XY (2, Math.floor(this.height / 2)));
        this.determineFoodPos ();
        const sub:any = Alias.tickService.tick.subscribe (()=>this.snake.tick());
        this.subscriptions.push (sub);
        this.isRunning = true;
    }

    public stop ():void {
        this.isRunning = false; 
        for(let subscription of this.subscriptions){
            subscription.unsubscribe ();
        }
        this.ended.emit ();
    }

    public eatFood ():void {
        this.determineFoodPos ();
    }

    public snakeDead ():void {
        this.stop ();
    }

    private determineFoodPos ():void {
        let ok:boolean = false;
        let x:number;
        let y:number;
        while(!ok){            
            x = Math.floor(Math.random () * this.width);
            y = Math.floor(Math.random () * this.height);
            if(!this.snake.snakeContainsPos (new XY(x, y))){
                ok = true;
            }
        }
        this.foodPos.x = x;
        this.foodPos.y = y;
    }


}
