import { AISnake } from './AISnake';
import { PlayerSnake } from './PlayerSnake';
import { XY } from './../model/XY';
import { Alias } from './../Alias';
import { StorageService } from './../storage/storage.service';
import { ConfigService } from './../config.service';
import { TickService } from './../tick.service';
import { KeyboardService } from './Keyboard.service';
import { Snake } from './Snake';
import { Injectable } from '@angular/core';

@Injectable()
export class GameService {

    private _gameBusy:boolean;
    private _foodPos:XY = new XY ();
    private _secs:number;
    private _timeInterval:any;
    private _foodNeuronsEnabled:boolean = true;
    private _bodyNeuronsEnabled:boolean = true;

    public width:number;
    public height:number;
    public eatenFoodCount:number;
    public snake:AISnake;
    public bestTicks:number = 0;
    public bestLength:number = 0;
    public bestSnake:AISnake;

    public get foodPos ():XY {
        return this._foodPos;
    }

    public get gameBusy():boolean{
        return this._gameBusy;        
    }

    public get time (){
        return this._secs;
    }

     public set bodyNeuronsEnabled (value:boolean){
        this._bodyNeuronsEnabled = value;
        this.snake.bodyNeuronsEnabled = this._bodyNeuronsEnabled;
    }

    public get bodyNeuronsEnabled ():boolean{
        return this._bodyNeuronsEnabled;
    }

    public set foodNeuronsEnabled (value:boolean){
        this._foodNeuronsEnabled = value;
        this.snake.foodNeuronsEnabled = this._foodNeuronsEnabled;

    }

    public get foodNeuronsEnabled ():boolean{
        return this._foodNeuronsEnabled;
    }

    constructor(
        private keyboardService:KeyboardService,
        private tickService:TickService,
        private configService:ConfigService,
        private storageService:StorageService
    ) {
        Alias.gameService = this;
        this.width = configService.width;
        this.height = configService.height;
        this.startGame ();

        this.tickService.tick.subscribe (()=>{
            this.tick ();
        })

       
        const best:any = this.storageService.load('best');
        if(best){
            this.bestLength = best.bodyParts.length;
            this.bestTicks = best.ticks;
        }

    }

    public snakeDead ():void {
        this.storageService.save('last', this.snake);
        this.stopGame ();
    }

    public stopGame ():void {
        this._gameBusy = false;
        clearInterval (this._timeInterval);
        setTimeout (() => this.startGame (), 1000);
    }

    private checkBestSnake ():void {
        if(!this.snake.killedBecauseOfCircularMotion){
            let grade:number = 0;
            if(this.snake.ticks >= this.bestTicks){
                this.bestTicks = this.snake.ticks;
                grade ++;
            }
            if(this.snake.bodyParts.length >= this.bestLength){
                this.bestLength = this.snake.bodyParts.length;
                grade ++;
            }

            if(grade == 2){
                this.bestSnake = this.snake;
                this.storageService.save ('best', this.bestSnake);
            }
        }
    }

    public startGame () {

        if(this.snake) {
            this.checkBestSnake ();
            this.snake.destroy ();
        }

        const snake:AISnake = this.bestSnake && Math.random () > .5 ? this.bestSnake.clone () : new AISnake ();
        this.startGameWithSnake (snake);
    } 

    public startGameWithSnake (snake:AISnake):void {
        this.snake = snake;
        this.snake.setHeadPosition (new XY (2, Math.floor(this.height / 2)));
        this.snake.foodNeuronsEnabled = this._foodNeuronsEnabled;
        this.snake.bodyNeuronsEnabled = this._bodyNeuronsEnabled;

        this.eatenFoodCount = 0;
        this._secs = 0;

        clearInterval (this._timeInterval);
        this._timeInterval = setInterval ( () => this._secs += 1000, 1000);

        this.determineFoodPos ();
        this._gameBusy = true;
        this.tickService.tick.emit ();
        this.tickService.emitDraw ();
    }

    public eatFood ():void {
        ++this.eatenFoodCount;
        this.determineFoodPos ();
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
        this._foodPos.x = x;
        this._foodPos.y = y;
    }

    private tick (){
        if(this._gameBusy){
            this.snake.tick ();
        }
    }



}