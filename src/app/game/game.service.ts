import { IStorageDescribtion } from './../storage/IStorageDescribtion';
import { CustomSnake } from './CustomSnake';
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
    private _borderNeuronsEnabled:boolean = true;
    private _foodNeuronsEnabled:boolean = true;
    private _bodyNeuronsEnabled:boolean = true;

    public width:number;
    public height:number;
    public eatenFoodCount:number;
    public snake:AISnake;
    public bestSnake:AISnake;
    public snakeCount:number = 0;

    public bestPool:AISnake[] = [];

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
        this.tickService.emitDraw ();
    }

    public get bodyNeuronsEnabled ():boolean{
        return this._bodyNeuronsEnabled;
    }

    public set foodNeuronsEnabled (value:boolean){
        this._foodNeuronsEnabled = value;
        this.snake.foodNeuronsEnabled = this._foodNeuronsEnabled;
        this.tickService.emitDraw ();
    }

    public get foodNeuronsEnabled ():boolean{
        return this._foodNeuronsEnabled;
    }

    public set borderNeuronsEnabled (value:boolean){
        this._borderNeuronsEnabled = value;
        this.snake.borderNeuronsEnabled = this._borderNeuronsEnabled;
        this.tickService.emitDraw ();
    }

    public get borderNeuronsEnabled ():boolean{
        return this._borderNeuronsEnabled;
    }


    constructor(
        private keyboardService:KeyboardService,
        private tickService:TickService,
        private configService:ConfigService,
        private storageService:StorageService
    ) {
        this.width = configService.width;
        this.height = configService.height;
        this.readBestStoredSnakes ();

        this.startGame ();

        this.tickService.tick.subscribe (()=>{
            this.tick (); 
        })

    }

    private readBestStoredSnakes ():void {
        // const best:any = this.storageService.load('best');
        const fileList:IStorageDescribtion[] = this.storageService.getFileList ();
        for(let item of fileList){
            let instance:AISnake = AISnake.fromJSON (item.o);
            console.log("item from filelist: " + instance);
            this.bestPool.push(instance);
        }
        this.trimBestPool ();

        if(this.bestPool.length > 0) {
            this.bestSnake = this.bestPool[0];
        }
    }

    private trimBestPool ():void {

        this.bestPool.sort ((a:AISnake, b:AISnake) => {
            
            if(a.bodyParts.length > b.bodyParts.length){
                return -1;
            }else if(a.bodyParts.length == b.bodyParts.length){
                
                if(a.ticks > b.ticks){
                    return -1;
                }else{
                    return 1;
                }                    

            }else{
                return 1
            }
        });
        
        const deleted:AISnake[] = this.bestPool.splice(this.configService.bestStoredSnakesCount);
        for(let snake of deleted){
            this.storageService.delete ('best_' + snake.id);
        }

    }

    public saveCurrentSnake ():void {
        this.storageService.save (this.snake.id, this.snake);
    }

    public snakeDead ():void {
        this.stopGame ();
    }

    public stopGame ():void {
        this._gameBusy = false;
        clearInterval (this._timeInterval);
        setTimeout (() => this.startGame (), 250 / (this.tickService.speed / 10));
    }

    private checkBestSnake ():void {
        if(!this.snake.killedBecauseOfCircularMotion){
            let grade:number = 0;
            
            if(this.bestSnake == undefined){
                this.bestSnake = this.snake;
            }

            if(this.snake.ticks >= this.bestSnake.ticks * .75) {
                grade ++;
            }
            if(this.snake.bodyParts.length >= this.bestSnake.bodyParts.length * .75){
                grade ++;
            }

            if(grade == 2) {
                this.bestSnake = this.snake;
            }

            if(grade > 0){
                this.bestPool.push(this.snake);
                this.storageService.save ('best_' + this.snake.id, this.snake);
                this.trimBestPool ();
            }

        }
    }


    private getSnakeCloneFromBestPool ():AISnake {
        if(this.bestPool.length == 0){
            return new AISnake ();
        }
        const idx:number = Math.floor(Math.random () * this.bestPool.length);
        return this.bestPool[idx].getMutatedClone ();
    }

    public startGame () {
       
        if(this.snake) {
            this.checkBestSnake ();
            this.snake.destroy ();
        }

        const snake:AISnake = this.bestSnake && Math.random () > .25 ? this.getSnakeCloneFromBestPool () : Math.random () > .9 ? new AISnake () : new CustomSnake ();
        this.startGameWithSnake (snake);
    } 

    public startGameWithSnake (snake:AISnake):void {
        this.snakeCount ++;
        this.snake = snake;
        
        if(this.bestSnake == undefined)
            this.bestSnake = this.snake;

        this.snake.setToGameStartValues ();
        this.snake.setHeadPosition (new XY (2, Math.floor(this.height / 2)));
        this.snake.borderNeuronsEnabled = this._borderNeuronsEnabled;
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