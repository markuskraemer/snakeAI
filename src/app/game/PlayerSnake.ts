import { Direction } from './../model/Direction.enum';
import { Key } from 'ts-keycode-enum';
import { Alias } from './../Alias';
import { Snake } from './Snake';

export class PlayerSnake extends Snake {

    constructor () {
        super ();
        this.addKeyboardEventListeners ();
    }

    private addKeyboardEventListeners ():void {
        Alias.keyboardService.mapDown (Key.W, () => { if(this.direction != Direction.Down) this.direction = Direction.Up });
        Alias.keyboardService.mapDown (Key.D, () => { if(this.direction != Direction.Left) this.direction = Direction.Right });
        Alias.keyboardService.mapDown (Key.A, () => { if(this.direction != Direction.Right) this.direction = Direction.Left });
        Alias.keyboardService.mapDown (Key.S, () => { if(this.direction != Direction.Up) this.direction = Direction.Down });
    }

     public destroy ():void {
        Alias.keyboardService.unmapDown (Key.W);
        Alias.keyboardService.unmapDown (Key.D);
        Alias.keyboardService.unmapDown (Key.A);
        Alias.keyboardService.unmapDown (Key.S);   
    }
}
