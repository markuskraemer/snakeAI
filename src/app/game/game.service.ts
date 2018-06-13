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
    public readonly width:number = 20;
    public readonly height:number = 20;
    public eatenFoodCount:number;
    public snake:Snake;
    
    public get foodPos ():XY {
        return this._foodPos;
    }

    public get gameBusy():boolean{
        return this._gameBusy;        
    }

    public get time (){
        return this._secs;
    }

    constructor(
        private keyboardService:KeyboardService,
        private tickService:TickService,
        private configService:ConfigService,
        private storageService:StorageService
    ) {
        Alias.gameService = this;
        this.startGame ();

        this.tickService.tick.subscribe (()=>{
            this.tick ();
        })

    }

    public snakeCollision ():void {
        this.stopGame ();
    }

    public stopGame ():void {
        this._gameBusy = false;
        clearInterval (this._timeInterval);
        setTimeout (() => this.startGame (), 1000);
    }

    public startGame () {

        this.eatenFoodCount = 0;
        this._secs = 0;

        clearInterval (this._timeInterval);
        this._timeInterval = setInterval ( () => this._secs += 1000, 1000);

        if(this.snake)
            this.snake.destroy ();

        this.snake = new Snake ();
        this.snake.setHeadPosition (new XY (2, Math.floor(this.height / 2)));
        
        this.determineFoodPos ();
        this._gameBusy = true;
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