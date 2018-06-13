import { Alias } from './../Alias';
import { Injectable } from '@angular/core';

@Injectable()
export class KeyboardService {

    private downLambdas:any = {};
    private upLambdas:any = {};
    private pressedKeys:any = {};

    constructor() { 
        Alias.keyboardService = this;
        window.addEventListener('keydown', (event:KeyboardEvent) => {
            this.pressedKeys[event.keyCode] = true;
            const lambda:any = this.downLambdas[event.keyCode];
            if(lambda){
                lambda ();
            }
        })
        window.addEventListener('keyup', (event:KeyboardEvent) => {
            this.pressedKeys[event.keyCode] = false;
            const lambda:any = this.upLambdas[event.keyCode];
            if(lambda){
                lambda ();
            }
        })
    }

    public isPressed (keyCode:number):boolean {
        return this.pressedKeys[keyCode];
    }

    public mapDown (keyCode:number, lambda:any):void {
        this.downLambdas[keyCode] = lambda;
    }

    public mapUp (keyCode:number, lambda:any):void {
        this.upLambdas[keyCode] = lambda;
    }

    public unmapDown (keyCode:number):void {
        this.downLambdas[keyCode] = null;
    }

    public unmapUp (keyCode:number):void {
        this.upLambdas[keyCode] = null;
    }

}